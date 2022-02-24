package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
)

type V1 struct {
	db database.Database
}

func New(db database.Database, app *fiber.App) V1 {
	var v1 = V1{
		db,
	}

	app.Get("/v1/ping", v1.Ping)
	app.Get("/v1/status", v1.Status)

	app.Get("/v1/users/all", v1.GetUsersAll)
	app.Get("/v1/users/uuid/:uuid", v1.GetUserByUuid)
	app.Get("/v1/users/email/:email", v1.GetUserByEmail)
	app.Get("/v1/users/username/:username", v1.GetUserByUsername)

	app.Post("/v1/auth/user/login", v1.LoginUser)
	app.Post("/v1/auth/user/signup", v1.SignupUser)

	// app.Patch("/me", v1.UpdateAvatar)

	return v1
}
