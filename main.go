package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func main() {

	// Clear terminal
	fmt.Print("\033[H\033[2J")

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World 👋!")
	})

	app.Listen(":3000")
}
