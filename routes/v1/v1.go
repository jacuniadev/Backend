package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/errors"
	"github.com/xornet-cloud/Backend/middleware"
	"github.com/xornet-cloud/Backend/validators"
	"go.mongodb.org/mongo-driver/bson"
)

type V1 struct {
	db database.Database
}

func (v1 V1) getDocByFieldFromParam(c *fiber.Ctx, docType string, paramName string) error {
	paramValue := c.Params(paramName)
	if !validators.IsNotEmpty(paramValue) {
		return errors.ParamInvalidError
	}

	var filter = bson.M{paramName: paramValue}

	if docType == "user" {
		doc, err := v1.db.GetUser(c.Context(), filter)
		if err != nil {
			return errors.UserNotFoundError
		}
		return c.JSON(&doc)
	} else if docType == "machine" {
		doc, err := v1.db.GetMachine(c.Context(), filter)
		if err != nil {
			return errors.UserNotFoundError
		}
		return c.JSON(&doc)
	}

	return c.Send(nil)
}

func New(db database.Database, app *fiber.App) V1 {
	var userMiddleware = middleware.UserMiddleware(&db)
	var v1 = V1{db}
	var v = "/v1"

	app.Get(v+"/ping", v1.Ping)
	app.Get(v+"/status", v1.Status)

	app.Post(v+"/auth/user/login", v1.LoginUser)
	app.Post(v+"/auth/user/signup", v1.SignupUser)
	// app.Post(v+"/auth/reporter/login", v1.LoginUser)
	// app.Post(v+"/auth/reporter/signup", v1.SignupUser)

	app.Get(v+"/users/all", v1.GetUsersAll)
	app.Get(v+"/users/uuid/:uuid", v1.GetUserByUuid)
	app.Get(v+"/users/email/:email", v1.GetUserByEmail)
	app.Get(v+"/users/username/:username", v1.GetUserByUsername)
	app.Get(v+"/users/me", userMiddleware, v1.GetMe)
	app.Get(v+"/users/me/machines", userMiddleware, v1.GetMeMachines)
	app.Patch(v+"/users/me/avatar", userMiddleware, v1.UpdateAvatar)

	app.Get(v+"/machines/all", userMiddleware, v1.GetMachinesAll)
	app.Get(v+"/machines/uuid/:uuid", userMiddleware, v1.GetMachineByUuid)
	app.Get(v+"/machines/hostname/:hostname", userMiddleware, v1.GetMachineByHostname)
	app.Get(v+"/machines/owner/:owner", userMiddleware, v1.GetMachineByOwner)

	// app.Get(v + "/machines/key", v1.GenerateSignupToken)
	// app.Delete(v + "/machines/uuid/:uuid", v1.DeleteMachine)

	return v1
}
