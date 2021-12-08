package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/utils"
)

func main() {
	db := database.Connect()

	utils.Log()

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {

		return c.Status(200).JSON(&fiber.Map{
			"message": "Hello world",
		})
	})

	app.Get("/users", func(c *fiber.Ctx) error {

		users, err := db.GetUsers()

		if err != nil {
			return c.Status(500).JSON(&fiber.Map{
				"message": "an error accured trolge",
				"err":     err,
			})
		}

		return c.Status(200).JSON(&users)
	})

	app.Listen(":3000")
}
