package v1

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
)

type V1 struct {
	db database.Database
}

type Register struct {
	verb     string
	endpoint string
	handler  func(c *fiber.Ctx) error
}

func New(db database.Database, app *fiber.App) V1 {
	var v1 = V1{
		db,
	}

	var registers = [9]Register{
		{"get", "/v1/ping", v1.Ping},
		{"get", "/v1/ping", v1.Ping},
		{"get", "/v1/status", v1.Status},
		{"get", "/v1/users/all", v1.GetUsersAll},
		{"get", "/v1/users/uuid/:uuid", v1.GetUserByUuid},
		{"get", "/v1/users/email/:email", v1.GetUserByEmail},
		{"get", "/v1/users/username/:username", v1.GetUserByUsername},
		{"post", "/v1/auth/user/login", v1.LoginUser},
		{"post", "/v1/auth/user/signup", v1.SignupUser},
	}

	for _, v := range registers {
		switch v.verb {
		case "get":
			app.Get(v.endpoint, v.handler)
		case "post":
			app.Post(v.endpoint, v.handler)
		case "put":
			app.Put(v.endpoint, v.handler)
		case "patch":
			app.Patch(v.endpoint, v.handler)
		case "delete":
			app.Delete(v.endpoint, v.handler)
		}
		fmt.Printf(" Registered %v %v\n", v.verb, v.endpoint)
	}

	return v1
}
