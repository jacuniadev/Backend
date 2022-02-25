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

type SuccessfullLogin struct {
	Token string `json:"token"`
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
