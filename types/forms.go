package types

type UserLoginForm struct {
	Username string `json:"username" xml:"username" form:"username"`
	Password string `json:"password" xml:"password" form:"password"`
}

type UserSignupForm struct {
	UserLoginForm
	Email          string `json:"email" xml:"email" form:"email"`
	PasswordRepeat string `json:"password_repeat" xml:"password_repeat" form:"password_repeat"`
}

type UserAvatarUpdateForm struct {
	Avatar string `json:"avatar" xml:"avatar" form:"avatar"`
}
