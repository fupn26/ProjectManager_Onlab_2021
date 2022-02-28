package main

import (
	"encoding/json"
	"fmt"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
	"github.com/sethgrid/pester"
	"io/ioutil"
	"log"
	"os"
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

func main() {
	conn, err := amqp.Dial("amqp://" + os.Getenv("RABBIT_USER") + ":" + os.Getenv("RABBIT_PASSWORD") + "@" + os.Getenv("RABBIT_HOST") + ":" + os.Getenv("RABBIT_PORT"))
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"hello", // name
		false,   // durable
		false,   // delete when unused
		false,   // exclusive
		false,   // no-wait
		nil,     // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Failed to register a consumer")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Received a message: %s", d.Body)
			sendEmail(d.Body)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
