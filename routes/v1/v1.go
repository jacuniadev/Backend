package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/middleware"
)

type V1 struct {
	db database.Database
}

func New(db database.Database, app *fiber.App) V1 {
	var userMiddleware = middleware.UserMiddleware(&db)
	var v1 = V1{db}
	var v = "/v1"

	app.Get(v+"/ping", v1.Ping)
	app.Get(v+"/status", userMiddleware, v1.Status)

	app.Post(v+"/auth/user/login", v1.LoginUser)
	app.Post(v+"/auth/user/signup", v1.SignupUser)
	// app.Post(v+"/auth/reporter/login", v1.LoginUser)
	// app.Post(v+"/auth/reporter/signup", v1.SignupUser)

	app.Get(v+"/users/all", v1.GetUsersAll)
	app.Get(v+"/users/uuid/:uuid", v1.GetUserByUuid)
	app.Get(v+"/users/email/:email", v1.GetUserByEmail)
	app.Get(v+"/users/username/:username", v1.GetUserByUsername)
	app.Get(v+"/users/me", userMiddleware, v1.GetMe)
	app.Patch(v+"/users/me/avatar", userMiddleware, v1.UpdateAvatar)

	// app.Get(v + "/machines/key", v1.GenerateSignupToken)
	// app.Delete(v + "/machines/uuid/:uuid", v1.DeleteMachine)

	return v1
}
