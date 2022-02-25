package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/errors"
	"github.com/xornet-cloud/Backend/types"
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
	users, err := v1.db.GetUsersAll(c.Context())
	if err != nil {
		return err
	}
	return c.JSON(&users)
}

func (v1 V1) UpdateAvatar(c *fiber.Ctx) error {
	user := c.Locals("user").(*database.User)
	var form = new(types.UserAvatarUpdateForm)
	if err := c.BodyParser(form); err != nil {
		return c.JSON(errors.FormInvalid)
	}

	user, err := v1.db.UpdateAvatar(c.Context(), user.Uuid, form.Avatar)
	if err != nil {
		return err
	}
	return c.JSON(&user)
}

func (v1 V1) GetMe(c *fiber.Ctx) error {
	user := c.Locals("user").(*database.User)
	return c.JSON(&user)
}
