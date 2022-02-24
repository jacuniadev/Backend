package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/middleware"
	v1 "github.com/xornet-cloud/Backend/routes/v1"
)

const MONGO_URL = "mongodb://localhost:27017"

func main() {
	db := database.Connect(MONGO_URL)
	app := fiber.New()

	app.Use(middleware.ErrorHandlerMiddleware)
	v1.New(db, app)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(&fiber.Map{
			"message": "Hello world",
		})
	})

	app.Listen(":3000")
}
