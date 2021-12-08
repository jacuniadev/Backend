package main

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Machine struct {
	id       string
	name     string
	location string
}

type User struct {
	id       string
	username string
	password string
	email    string
	avatar   string
	banner   string
	machines []Machine
}

func newUser(id string, username string, password string, email string, avatar string, banner string) *User {
	return &User{
		id:       id,
		username: username,
		password: password,
		email:    email,
		avatar:   avatar,
		banner:   banner,
		machines: []Machine{},
	}
}

// Shorthand to print somethng to the console
func log(a ...interface{}) {
	fmt.Print(a...)
}

// Clears the terminal by sending special characters
func clear_terminal() {
	log("\033[H\033[2J")
}

func main() {
	ctx := context.Background()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log(err)
	}
	defer func() { _ = client.Disconnect(ctx) }()

	// Clear terminal
	clear_terminal()

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {

		log(c.BaseURL())

		return c.Status(200).JSON(&fiber.Map{
			"message": "Hello world",
		})
	})

	app.Listen(":3000")
}
