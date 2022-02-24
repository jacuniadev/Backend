package database

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/xornet-cloud/Backend/auth"
	"github.com/xornet-cloud/Backend/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	mongo *mongo.Database
	ctx   *context.Context
}

type User struct {
	Email          string  `json:"email"`
	Password       string  `json:"password"`
	Username       string  `json:"username"`
	Uuid           string  `json:"uuid"`
	Avatar         string  `json:"avatar"`
	ClientSettings string  `json:"client_settings"`
	CreatedAt      float32 `json:"created_at"`
	UpdatedAt      float32 `json:"updated_at"`
}

type Machine struct {
	CreatedAt    float32            `json:"created_at"`
	UpdatedAt    float32            `json:"updated_at"`
	Status       string             `json:"status"`
	OwnerUuid    string             `json:"owner_uuid"`
	AccessToken  string             `json:"access_token"`
	HardwareUuid string             `json:"hardware_uuid"`
	Name         string             `json:"name"`
	Access       []string           `json:"access"`
	Uuid         string             `json:"uuid"`
	StaticData   *MachineStaticData `json:"static_data"`
}

type MachineStaticData struct {
	Hostname   string `json:"hostname"`
	PublicIp   string `json:"public_ip"`
	OsName     string `json:"os_name"`
	OsVersion  string `json:"os_version"`
	CpuModel   string `json:"cpu_model"`
	CpuCores   string `json:"cpu_cores"`
	CpuThreads string `json:"cpu_threads"`
}

func Connect(url string) (*Database, error) {

	client, err := mongo.NewClient(options.Client().ApplyURI(url))
	if err != nil {
		return nil, err
	}
	ctx := context.TODO()
	err = client.Connect(ctx)
	if err != nil {
		return nil, err
	}
	return &Database{
		client.Database("xornet"),
		&ctx,
	}, nil
}

func (db *Database) CreateUser(c context.Context, form types.UserSignupForm) (*User, error) {
	var uuid = uuid.New().String()
	var timestamp = time.Now()

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

	var _, err = db.mongo.Collection("users").InsertOne(c, userDocument)
	if err != nil {
		return nil, err
	}

	var user, userErr = db.GetUserByUuid(c, uuid)

	if userErr != nil {
		return nil, userErr
	}

	return user, nil
}

func (db *Database) GetUser(c context.Context, filter bson.M) (*User, error) {
	var user User

	var result = db.mongo.Collection("users").FindOne(c, filter)
	if err := result.Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (db *Database) GetUserByUuid(c context.Context, uuid string) (*User, error) {
	return db.GetUser(c, bson.M{"uuid": uuid})
}

func (db *Database) GetUserByEmail(c context.Context, username string) (*User, error) {
	return db.GetUser(c, bson.M{"email": username})
}

func (db *Database) GetUsersAll(c context.Context) ([]User, error) {
	// Get all the users from the database
	cursor, err := db.mongo.Collection("users").Find(c, bson.D{})
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
