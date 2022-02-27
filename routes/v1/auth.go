package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/apierrors"
	"github.com/xornet-cloud/Backend/types"
	"github.com/xornet-cloud/Backend/validators"
)

func (v1 V1) SignupUser(c *fiber.Ctx) error {
	var form = new(types.UserSignupForm)
	if err := c.BodyParser(form); err != nil {
		return apierrors.FormInvalid
	}
	if !validators.ValidateUsername(form.Username) {
		return apierrors.UsernameInvalid
	}
	if !validators.ValidateEmail(form.Email) {
		return apierrors.EmailInvalid
	}
	if !validators.ValidatePassword(form.Password) {
		return apierrors.PasswordInvalid
	}
	if !validators.ValidatePassword(form.PasswordRepeat) {
		return apierrors.PasswordRepeatInvalid
	}
	if form.Password != form.PasswordRepeat {
		return apierrors.PasswordMismatch
	}

	var success, err = v1.db.CreateUser(c.Context(), *form)
	if err != nil {
		return apierrors.UserCreationFailure
	}
	return c.JSON(success)
}

func (v1 V1) LoginUser(c *fiber.Ctx) error {
	var form = new(types.UserLoginForm)
	if err := c.BodyParser(form); err != nil {
		return apierrors.FormInvalid
	}
	if !validators.ValidatePassword(form.Password) {
		return apierrors.CredentialsInvalid
	}
	if !validators.ValidateUsername(form.Username) {
		return apierrors.CredentialsInvalid
	}

	var success, err = v1.db.LoginUser(c.Context(), *form)
	if err != nil {
		return apierrors.CredentialsInvalid
	}
	return c.JSON(success)
}
