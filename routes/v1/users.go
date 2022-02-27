package v1

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/apierrors"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/types"
	"go.mongodb.org/mongo-driver/bson"
)

func (v1 V1) GetUserByUuid(c *fiber.Ctx) error {
	return v1.getDocByFieldFromParam(c, "users", "uuid")
}

func (v1 V1) GetUserByEmail(c *fiber.Ctx) error {
	return v1.getDocByFieldFromParam(c, "users", "email")
}

func (v1 V1) GetUserByUsername(c *fiber.Ctx) error {
	return v1.getDocByFieldFromParam(c, "users", "username")
}

func (v1 V1) GetUsersAll(c *fiber.Ctx) error {
	users, err := v1.db.GetUsers(c.Context(), bson.M{})
	if err != nil {
		return err
	}
	return c.JSON(&users)
}

func (v1 V1) UpdateAvatar(c *fiber.Ctx) error {
	user := c.Locals("user").(*database.User)
	var form = new(types.UserAvatarUpdateForm)
	if err := c.BodyParser(form); err != nil {
		return apierrors.FormInvalid
	}

	user, err := v1.db.UpdateAvatar(c.Context(), user.Uuid, form.Url)
	if err != nil {
		fmt.Print(err)
		return err
	}
	return c.JSON(&user)
}

func (v1 V1) GetMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*database.User)
	return c.JSON(&user)
}

func (v1 V1) GetMeMachines(c *fiber.Ctx) error {
	// user := c.Locals("user").(*database.User)
	// machines, err := v1.db.GetMachinesByOwnerUuid(c.Context(), user.Uuid)
	machines, err := v1.db.GetMachines(c.Context(), bson.M{})
	if err != nil {
		return err
	}
	return c.JSON(&machines)
}
