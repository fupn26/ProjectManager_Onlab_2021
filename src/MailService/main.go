package main

import (
	"encoding/json"
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"github.com/sethgrid/pester"
	"github.com/wagslane/go-rabbitmq"
	"io/ioutil"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

const consumerName = "MailService"

var senderName = os.Getenv("SENDGRID_SENDER_NAME")
var senderEmail = os.Getenv("SENDGRID_SENDER_EMAIL")
var from = mail.NewEmail(senderName, senderEmail)
var client = sendgrid.NewSendClient(os.Getenv("SENDGRID_API_KEY"))

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func contains(slice []string, stringToFind string) bool {
	for _, v := range slice {
		if v == stringToFind {
			return true
		}
	}
	return false
}

func filterUsersSlice(userDtos []UserDto, userIds []string) []User {
	var result []User
	for _, v := range userDtos {
		if contains(userIds, v.Id) {
			result = append(result, User{Name: v.Name, Email: v.Email})
		}
	}
	return result
}

func getUserInfos(userIds []string) ([]User, error) {
	client := pester.New()
	client.Backoff = pester.ExponentialBackoff

	resp, err := client.Get("http://" + os.Getenv("USER_SERVICE_HOST") + ":" + os.Getenv("USER_SERVICE_PORT") + "/api/v1/user")

	if err != nil {
		log.Println("error GETing user list", client.LogString())
		return nil, err
	}
	defer resp.Body.Close()
	log.Printf("example.com %s", resp.Status)
	body, err := ioutil.ReadAll(resp.Body)

	var userDtos []UserDto
	err = json.Unmarshal(body, &userDtos)
	if err != nil {
		log.Println(err)
	}
	return filterUsersSlice(userDtos, userIds), err
}

func generateProjectEmails(messageToProcess []byte) []*mail.SGMailV3 {
	var subject string
	var htmlContent string
	var projectActivity ProjectActivity
	err := json.Unmarshal(messageToProcess, &projectActivity)

	if err != nil {
		log.Println(err)
		return nil
	}
	if projectActivity.ActivityType == CREATED {
		subject = projectActivity.ProjectTitle + " project created"
		htmlContent = "The <strong>" + projectActivity.ProjectTitle + "</strong> project has been created."
	}

	users, err := getUserInfos(projectActivity.MemberIds)

	if err != nil {
		log.Println(err)
		return nil
	}

	result := make([]*mail.SGMailV3, len(users))

	for i, v := range users {

		to := mail.NewEmail(v.Name, v.Email)
		message := mail.NewSingleEmail(from, subject, to, "", htmlContent)
		result[i] = message

		log.Println(v)

	}

	return result
}

func processMessage(messageToProcess rabbitmq.Delivery) {
	var emails []*mail.SGMailV3

	if messageToProcess.Type == "project" {
		emails = generateProjectEmails(messageToProcess.Body)
	}

	for _, v := range emails {
		response, err := client.Send(v)
		if err != nil {
			log.Println(err)
		} else {
			fmt.Println(response.StatusCode)
			fmt.Println(response.Body)
			fmt.Println(response.Headers)
		}
	}
}

func main() {
	var consumer rabbitmq.Consumer
	var err error
	counter := 0
	timeToWait := time.Second
	for {
		consumer, err = rabbitmq.NewConsumer(
			"amqp://"+os.Getenv("RABBIT_USER")+":"+os.Getenv("RABBIT_PASSWORD")+"@"+os.Getenv("RABBIT_HOST")+":"+os.Getenv("RABBIT_PORT"),
			amqp.Config{},
			rabbitmq.WithConsumerOptionsLogging,
		)
		if err != nil {
			if counter < 5 {
				time.Sleep(timeToWait)
				counter += 1
				timeToWait *= 2
				log.Println("Waiting for RabbitMQ server...")
			} else {
				failOnError(err, "Failed to connect to RabbitMQ")
			}
		} else {
			break
		}
	}

	defer consumer.Disconnect()
	defer consumer.StopConsuming(consumerName, false)

	err = consumer.StartConsuming(
		func(d rabbitmq.Delivery) rabbitmq.Action {
			log.Printf("consumed: %v", string(d.Body))
			processMessage(d)
			return rabbitmq.Ack
		},
		"hello",
		[]string{"routing_key1", "routing_key2"},
	)

	failOnError(err, "Failure during consuming")

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)

	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigs
		fmt.Println()
		fmt.Println(sig)
		done <- true
	}()

	fmt.Println("awaiting signal")
	<-done
	fmt.Println("stopping consumer")
}
