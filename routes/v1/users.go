package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/errors"
	"github.com/xornet-cloud/Backend/validators"
	"go.mongodb.org/mongo-driver/bson"
)

func (v1 V1) getUserByField(c *fiber.Ctx, fieldName string) error {
	param := c.Params(fieldName)
	if !validators.IsNotEmpty(param) {
		return errors.ParamInvalidError
	}

	user, err := v1.db.GetUser(c.Context(), bson.M{fieldName: param})
	if err != nil {
		return errors.UserNotFoundError
	}

	return c.JSON(&user)
}

func (v1 V1) GetUserByUuid(c *fiber.Ctx) error {
	return v1.getUserByField(c, "uuid")
}

func (v1 V1) GetUserByEmail(c *fiber.Ctx) error {
	return v1.getUserByField(c, "email")
}

func (v1 V1) GetUserByUsername(c *fiber.Ctx) error {
	return v1.getUserByField(c, "username")
}

func (v1 V1) GetUsersAll(c *fiber.Ctx) error {
	users, err := v1.db.GetUsersAll(c.Context())
	if err != nil {
		return err
	}
	return c.JSON(&users)
}
