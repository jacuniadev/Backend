package v1

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/xornet-cloud/Backend/auth"
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
	var keyManager = auth.NewKeyManager()

	var v1 = V1{db}
	var v = "/v1"

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/:id", websocket.New(func(c *websocket.Conn) {
		// c.Locals is added to the *websocket.Conn
		println(c.Locals("allowed"))  // true
		println(c.Params("id"))       // 123
		println(c.Query("v"))         // 1.0
		println(c.Cookies("session")) // ""

		// websocket.Conn bindings https://pkg.go.dev/github.com/fasthttp/websocket?tab=doc#pkg-index
		var messageType int
		var message []byte
		var err error

		for {
			if messageType, message, err = c.ReadMessage(); err != nil {
				println("read:", err)
				break
			}
			log.Printf("recv: %s", message)

			if err = c.WriteMessage(messageType, message); err != nil {
				println("write:", err)
				break
			}
		}

	}))

	app.Get(v+"/ping", v1.Ping)
	app.Get(v+"/status", v1.Status)

	app.Post(v+"/auth/user/login", v1.LoginUser)
	app.Post(v+"/auth/user/signup", v1.SignupUser)

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

	app.Get(v+"/machines/key", userMiddleware, func(c *fiber.Ctx) error { return v1.GenerateSignupToken(c, keyManager) })
	app.Post(v+"/auth/reporter/signup", func(c *fiber.Ctx) error { return v1.SignupMachine(c, keyManager) })
	app.Delete(v+"/machines/uuid/:uuid", v1.DeleteMachine)

	return v1
}
