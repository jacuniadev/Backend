package apierrors

import "github.com/gofiber/fiber/v2"

type ApiError struct {
	Name   string
	Status int32
}

func (err ApiError) Error() string {
	return err.Name
}

var (
	ParamInvalidError = ApiError{
		"param.invalid",
		fiber.StatusBadRequest,
	}
	DeletionFailure = ApiError{
		"deletion.failure",
		fiber.StatusInternalServerError,
	}
	InsufficientPermissions = ApiError{
		"permissions.insufficient",
		fiber.StatusForbidden,
	}
	UserNotFoundError = ApiError{
		"user.notFound",
		fiber.StatusNotFound,
	}
	MachineNotFoundError = ApiError{
		"machine.notFound",
		fiber.StatusNotFound,
	}
	KeyExpired = ApiError{
		"key.expired",
		fiber.StatusBadRequest,
	}
	KeyInvalid = ApiError{
		"key.invalid",
		fiber.StatusBadRequest,
	}
	EmailInvalid = ApiError{
		"email.invalid",
		fiber.StatusBadRequest,
	}
	UserNotAuthenticated = ApiError{
		"auth.invalid",
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
	MachineCreationFailure = ApiError{
		"machine.creationFailure",
		fiber.StatusInternalServerError,
	}
	CredentialsInvalid = ApiError{
		"credentials.invalid",
		fiber.StatusBadRequest,
	}
	UpdateFailed = ApiError{
		"update.failure",
		fiber.StatusInternalServerError,
	}
)
