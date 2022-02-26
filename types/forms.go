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

type GenericMessage struct {
	Message string `json:"message" xml:"message" form:"message"`
}

type UserAvatarUpdateForm struct {
	Avatar string `json:"avatar" xml:"avatar" form:"avatar"`
}

type MachineSignupKey struct {
	Key        string `json:"key" xml:"key" form:"key"`
	Expiration int64  `json:"expiration" xml:"expiration" form:"expiration"`
}

type MachineSignupForm struct {
	TwoFactorKey string `json:"two_factor_key" xml:"two_factor_key" form:"two_factor_key"`
	HardwareUuid string `json:"hardware_uuid" xml:"hardware_uuid" form:"hardware_uuid"`
	Hostname     string `json:"hostname" xml:"hostname" form:"hostname"`
}
