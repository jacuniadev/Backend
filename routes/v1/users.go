package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/errors"
	"github.com/xornet-cloud/Backend/types"
	"github.com/xornet-cloud/Backend/validators"
	"go.mongodb.org/mongo-driver/bson"
)

func (v1 V1) Ping(c *fiber.Ctx) error {
	return c.Send(nil)
}

func (v1 V1) getUserByField(c *fiber.Ctx, fieldName string) error {
	param := c.Params(fieldName)
	if param == "" {
		return errors.ParamInvalidError
	}

	user, err := v1.db.GetUser(c.Context(), bson.M{fieldName: param})

	if err != nil {
		return errors.UserNotFoundError
	}

	return c.JSON(&user)
}

func (v1 V1) SignupUser(c *fiber.Ctx) error {
	var form = new(types.UserSignupForm)

	if err := c.BodyParser(form); err != nil {
		return errors.FormInvalid
	}
	if !validators.ValidateEmail(form.Email) {
		return errors.EmailInvalid
	}
	if !validators.ValidatePassword(form.Password) {
		return errors.UsernameInvalid
	}
	if !validators.ValidateUsername(form.Username) {
		return errors.PasswordInvalid
	}

	var token, err = v1.db.CreateUser(c.Context(), *form)
	if err != nil {
		return errors.UserCreationFailure
	}
	return c.JSON(token)
}
func (v1 V1) LoginUser(c *fiber.Ctx) error {
	var form = new(types.UserLoginForm)
	if !validators.ValidatePassword(form.Password) {
		return errors.CredentialsInvalid
	}
	if !validators.ValidateUsername(form.Username) {
		return errors.CredentialsInvalid
	}

	var token, err = v1.db.LoginUser(c.Context(), *form)
	if err != nil {
		return errors.CredentialsInvalid
	}
	return c.JSON(token)
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
