package auth

import (
	"errors"
	"fmt"
	"os"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GetUuidFromToken(tokenString string) (string, error) {
	// Get the token struct out of the tokenString from the auth header
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// i dont know what this does
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Return the secret to the parser so it can decrypt the tokens's content
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	// if there was an error parsing the token then fuck them
	if err != nil {
		return "", err
	}

	// if the token is valid
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		uuid := claims["uuid"]
		if uuid == nil {
			return "", errors.New("uuid field can't be nil")
		}
		// Get the uuid from the jwt map
		return uuid.(string), nil
	} else {
		// else fuck them
		return "", err
	}
}
