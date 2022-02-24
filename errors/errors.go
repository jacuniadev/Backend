package errors

import "github.com/gofiber/fiber/v2"

type ApiError struct {
	Name   string
	Status int32
}

var (
	ParamInvalidError = ApiError{
		"param.invalid",
		fiber.StatusBadRequest,
	}
	UserNotFoundError = ApiError{
		"user.notFound",
		fiber.StatusNotFound,
	}
	EmailInvalid = ApiError{
		"email.invalid",
		fiber.StatusBadRequest,
	}
	UsernameInvalid = ApiError{
		"username.invalid",
		fiber.StatusBadRequest,
	}
	PasswordInvalid = ApiError{
		"password.invalid",
		fiber.StatusBadRequest,
	}
	PasswordRepeatInvalid = ApiError{
		"password.repeatInvalid",
		fiber.StatusBadRequest,
	}
	PasswordMismatch = ApiError{
		"password.mismatch",
		fiber.StatusBadRequest,
	}
	FormInvalid = ApiError{
		"form.invalid",
		fiber.StatusBadRequest,
	}
	UserCreationFailure = ApiError{
		"user.creationFailure",
		fiber.StatusInternalServerError,
	}
	CredentialsInvalid = ApiError{
		"credentials.invalid",
		fiber.StatusForbidden,
	}
	UpdateFailed = ApiError{
		"update.failed",
		fiber.StatusInternalServerError,
	}
)

func (err ApiError) Error() string {
	return err.Name
}
