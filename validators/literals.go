package validators

import "regexp"

// Checks if a string's length is within a bound
func IsInBounds(str string, min int, max int) bool {
	return !(len(str) < min || len(str) > max)
}

// Checks if a string does not have a length of 0
func IsNotEmpty(str string) bool {
	return len(str) != 0
}

// Checks if a string includes a character
func matchesRegex(str string, regex string) bool {
	return regexp.MustCompile(regex).MatchString(str)
}