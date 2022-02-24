package errors

type ApiError struct {
	Name   string
	Status int32
}

var (
	ParamInvalidError = ApiError{
		"param.invalid",
		403,
	}
	UserNotFoundError = ApiError{
		"user.notFound",
		404,
	}
)

func (err ApiError) Error() string {
	return err.Name
}
