package database

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	mongo *mongo.Database
	ctx   *context.Context
}

type User struct {
	Email          string `json:"email" bson:"email"`
	Password       string `json:"password" bson:"password"`
	Username       string `json:"username" bson:"username"`
	Uuid           string `json:"uuid" bson:"uuid"`
	Avatar         string `json:"avatar" bson:"avatar"`
	ClientSettings string `json:"client_settings" bson:"client_settings"`
	CreatedAt      int64  `json:"created_at" bson:"created_at"`
	UpdatedAt      int64  `json:"updated_at" bson:"updated_at"`
}

type Machine struct {
	CreatedAt    int64             `json:"created_at" bson:"created_at"`
	UpdatedAt    int64             `json:"updated_at" bson:"updated_at"`
	Status       string            `json:"status" bson:"status"`
	OwnerUuid    string            `json:"owner_uuid" bson:"owner_uuid"`
	AccessToken  string            `json:"access_token" bson:"access_token"`
	HardwareUuid string            `json:"hardware_uuid" bson:"hardware_uuid"`
	Name         string            `json:"name" bson:"name"`
	Access       []string          `json:"access" bson:"access"`
	Uuid         string            `json:"uuid" bson:"uuid"`
	StaticData   MachineStaticData `json:"static_data" bson:"static_data"`
}

type MachineStaticData struct {
	Hostname        string `json:"hostname" bson:"hostname"`
	PublicIP        string `json:"public_ip" bson:"public_ip"`
	CPUModel        string `json:"cpu_model" bson:"cpu_model"`
	CPUCores        int32  `json:"cpu_cores" bson:"cpu_cores"`
	CPUThreads      int32  `json:"cpu_threads" bson:"cpu_threads"`
	OSVersion       string `json:"os_version" bson:"os_version"`
	OSName          string `json:"os_name" bson:"os_name"`
	TotalMemory     int32  `json:"total_mem" bson:"total_mem"`
	ReporterVersion string `json:"reporter_version" bson:"reporter_version"`
}

type SuccessfullLogin struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type SuccessfullMachineLogin struct {
	AccessToken string `json:"access_token"`
}

// Connects to the provided MongoDB server
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

func (db *Database) getDocument(c context.Context, collection string, filter bson.M) *mongo.SingleResult {
	return db.mongo.Collection(collection).FindOne(c, filter)
}
