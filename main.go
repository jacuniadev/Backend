package main

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/middleware"
	v1 "github.com/xornet-cloud/Backend/routes/v1"
)

const APP_NAME = "Xornet Backend"
const CLEAR_SCREEN = "\033[H\033[2J"
const CYAN_COLOR = "\033[36m"
const MONGO_URL = "mongodb://localhost:27017"
const PORT = 3000
const LOGO = `
   _  __                      __ 
  | |/ /___  _________  ___  / /_
  |   / __ \/ ___/ __ \/ _ \/ __/
 /   / /_/ / /  / / / /  __/ /_    ___           __               __  
/_/|_\____/_/  /_/ /_/\___/\__/   / _ )___ _____/ /_____ ___  ___/ / 
                                 / _  / _ ` + ` / __/  '_/ -_) _ \/ _  /  
                Made in Golang  /____/\_,_/\__/_/\_\\__/_//_/\_,_/   
`

func main() {

	print(CLEAR_SCREEN)
	println(string(CYAN_COLOR), LOGO)

	db, err := database.Connect(MONGO_URL)
	if err != nil {
		println("Database failed to connect")
		panic(1)
	}
	app := fiber.New(fiber.Config{
		AppName: APP_NAME,
	})

	app.Use(middleware.ErrorHandlerMiddleware)
	v1.New(*db, app)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(&fiber.Map{
			"message": "Hello world",
		})
	})

	app.Listen(":" + strconv.Itoa(PORT))
}
