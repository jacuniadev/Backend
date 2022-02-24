package utils

import "fmt"

// Shorthand to print somethng to the console
func Log(a ...interface{}) {
	fmt.Print(a...)
}

// Clears the terminal by sending special characters
func ClearTerminal() {
	Log("\033[H\033[2J")
}
