package database

import (
	"context"

	"github.com/xornet-cloud/Backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	mongo *mongo.Database
	ctx   *context.Context
}

type User struct {
	Username string `json:"username"`
}

func Connect() Database {
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		utils.Log(err)
	}
	ctx := context.TODO()
	err = client.Connect(ctx)
	if err != nil {
		utils.Log(err)
	}

	return Database{
		client.Database("xornet"),
		&ctx,
	}
}

func (db *Database) GetUsers() ([]User, error) {
	// Get all the users from the database
	cursor, err := db.mongo.Collection("users").Find(*db.ctx, bson.D{})
	if err != nil {
		// if theres an error return it
		return nil, err
	}

	// Prepare users array
	var users []User

	// Pass a pointer to the users array for this dumb function to write the users to
	if err := cursor.All(*db.ctx, &users); err != nil {
		return nil, err
	}

	// Return the users
	return users, nil
}
