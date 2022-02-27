package database

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/xornet-cloud/Backend/auth"
	"github.com/xornet-cloud/Backend/types"
	"go.mongodb.org/mongo-driver/bson"
)

// Logs a user in with the provided form and if checks pass -> returns a token
// that they can store in the localstorage
func (db *Database) LoginUser(c context.Context, form types.UserLoginForm) (*SuccessfullLogin, error) {
	user, err := db.GetUserByUsername(c, form.Username)
	if err != nil {
		return nil, err
	}

	if !auth.CheckPasswordHash(form.Password, user.Password) {
		return nil, errors.New("invalidPassword")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"uuid": user.Uuid})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return nil, errors.New("tokenSigningFailure")
	}

	return &SuccessfullLogin{
		Token: tokenString,
		User:  *user,
	}, nil
}

// Creates a user in the database with a signup form and returns a login token
// so they can instantly login to their accounts and store the token in localstorage
func (db *Database) CreateUser(c context.Context, form types.UserSignupForm) (*SuccessfullLogin, error) {
	var uuid = uuid.New().String()
	var timestamp = time.Now().UnixMilli()

	var hashedPassword, hashErr = auth.HashPassword(form.Password)
	if hashErr != nil {
		return nil, hashErr
	}

	var userDocument = bson.M{
		"email":           form.Email,
		"password":        hashedPassword,
		"username":        form.Username,
		"uuid":            uuid,
		"avatar":          "",
		"client_settings": "",
		"created_at":      timestamp,
		"updated_at":      timestamp,
	}

	var _, insertErr = db.mongo.Collection("users").InsertOne(c, userDocument)
	if insertErr != nil {
		return nil, insertErr
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"uuid": uuid})

	tokenString, err := token.SignedString([]byte("pussyily2124124912mwuamamsita"))
	if err != nil {
		return nil, errors.New("tokenSigningFailure")
	}

	var user, userErr = db.GetUserByUuid(c, uuid)
	if userErr != nil {
		return nil, userErr
	}

	return &SuccessfullLogin{
		Token: tokenString,
		User:  *user,
	}, nil
}

// Gets a user from the database provider a bson filter for mongo
func (db *Database) GetUser(c context.Context, filter bson.M) (*User, error) {
	var user User
	var result = db.getDocument(c, "users", filter)
	if err := result.Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

// Gets a user from the database by their uuid
func (db *Database) GetUserByUuid(c context.Context, uuid string) (*User, error) {
	return db.GetUser(c, bson.M{"uuid": uuid})
}

// Gets a user from the database by their email
func (db *Database) GetUserByEmail(c context.Context, email string) (*User, error) {
	return db.GetUser(c, bson.M{"email": email})
}

// Gets a user from the database by their username
func (db *Database) GetUserByUsername(c context.Context, username string) (*User, error) {
	return db.GetUser(c, bson.M{"username": username})
}

// Gets all the users from the database
func (db *Database) GetUsers(c context.Context, filter bson.M) ([]User, error) {
	// Get all the users from the database
	cursor, err := db.mongo.Collection("users").Find(c, filter)
	if err != nil {
		// if theres an error return it
		return nil, err
	}

	// Prepare users array
	var users []User

	// Pass a pointer to the users array for this dumb function to write the users to
	if err := cursor.All(c, &users); err != nil {
		return nil, err
	}

	// Return the users
	return users, nil
}

// Updates a user's avatar
func (db *Database) UpdateField(c context.Context, uuid string, fieldName string, fieldValue string) (*User, error) {
	target := bson.M{"uuid": uuid}

	_, err := db.mongo.Collection("users").UpdateOne(c, target, bson.M{"$set": bson.M{fieldName: fieldValue}})
	if err != nil {
		return nil, err
	}

	user, err := db.GetUser(c, target)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// Updates a user's avatar
func (db *Database) UpdateAvatar(c context.Context, uuid string, avatar string) (*User, error) {
	return db.UpdateField(c, uuid, "avatar", avatar)
}
