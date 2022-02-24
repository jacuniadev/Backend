package errors

type ApiError struct {
	Name   string
	Status int32
}

var (
	ParamInvalidError = ApiError{
		"param.invalid",
		400,
	}
	UserNotFoundError = ApiError{
		"user.notFound",
		404,
	}
	EmailInvalid = ApiError{
		"email.invalid",
		400,
	}
	UsernameInvalid = ApiError{
		"username.invalid",
		400,
	}
	PasswordInvalid = ApiError{
		"password.invalid",
		400,
	}
	FormInvalid = ApiError{
		"form.invalid",
		400,
	}
	UserCreationFailure = ApiError{
		"user.creationFailure",
		500,
	}
)

func (err ApiError) Error() string {
	return err.Name
}
