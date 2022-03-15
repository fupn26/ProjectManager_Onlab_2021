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
)

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
		log.Println("error GETing example.com", client.LogString())
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

func sendEmail(messageJson []byte) {
	var projectActivity ProjectActivity
	err := json.Unmarshal(messageJson, &projectActivity)
	if err != nil {
		log.Println(err)
		return
	}

	from := mail.NewEmail(os.Getenv("SENDGRID_SENDER_NAME"), os.Getenv("SENDGRID_SENDER_EMAIL"))
	var subject string
	var htmlContent string
	if projectActivity.ActivityType == CREATED {
		subject = projectActivity.ProjectTitle + " project created"
		htmlContent = "The <strong>" + projectActivity.ProjectTitle + "</strong> project has been created."
	}
	key := os.Getenv("SENDGRID_API_KEY")
	client := sendgrid.NewSendClient(key)

	users, err := getUserInfos(projectActivity.MemberIds)
	for _, v := range users {

		to := mail.NewEmail(v.Name, v.Email)
		message := mail.NewSingleEmail(from, subject, to, "", htmlContent)
		response, err := client.Send(message)

		log.Println(v)

		if err != nil {
			log.Println(err)
		} else {
			fmt.Println(response.StatusCode)
			fmt.Println(response.Body)
			fmt.Println(response.Headers)
		}
	}
}

var consumerName = "MailService"

func main() {
	consumer, err := rabbitmq.NewConsumer(
		"amqp://"+os.Getenv("RABBIT_USER")+":"+os.Getenv("RABBIT_PASSWORD")+"@"+os.Getenv("RABBIT_HOST")+":"+os.Getenv("RABBIT_PORT"),
		amqp.Config{},
		rabbitmq.WithConsumerOptionsLogging,
	)
	failOnError(err, "Failed to connect to RabbitMQ")

	defer consumer.Disconnect()
	defer consumer.StopConsuming(consumerName, false)

	err = consumer.StartConsuming(
		func(d rabbitmq.Delivery) rabbitmq.Action {
			log.Printf("consumed: %v", string(d.Body))
			sendEmail(d.Body)
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
