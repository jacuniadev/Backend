package types

type Machine struct {
	id       string
	name     string
	location string
}

type User struct {
	id       string
	username string
	password string
	email    string
	avatar   string
	banner   string
	machines []Machine
}
