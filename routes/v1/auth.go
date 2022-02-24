package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/errors"
	"github.com/xornet-cloud/Backend/types"
	"github.com/xornet-cloud/Backend/validators"
)

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
