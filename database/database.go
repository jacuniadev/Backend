package database

import (
	"context"
	"time"

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
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
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
	cursor, err := db.mongo.Collection("users").Find(*db.ctx, bson.D{})

	// if theres an error return it
	if err != nil {
		return nil, err
	}

	var users []User

	if err := cursor.All(*db.ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}
