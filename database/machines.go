package database

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"github.com/xornet-cloud/Backend/types"
	"go.mongodb.org/mongo-driver/bson"
)

// Creates a user in the database with a signup form and returns a login token
// so they can instantly login to their accounts and store the token in localstorage
func (db *Database) CreateMachine(c context.Context, ownerUuid string, form types.MachineSignupForm) (*SuccessfullMachineLogin, error) {
	var uuid = uuid.New().String()
	var timestamp = int32(time.Now().UnixMilli())
	var access []string
	var token = jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"uuid": uuid})
	var tokenString, err = token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	if err != nil {
		return nil, errors.New("tokenSigningFailure")
	}

	var machineDocument = bson.M{
		"created_at":    timestamp,
		"updated_at":    timestamp,
		"status":        "0",
		"owner_uuid":    ownerUuid,
		"access_token":  tokenString,
		"hardware_uuid": form.HardwareUuid,
		"name":          form.Hostname,
		"access":        access,
		"uuid":          uuid,
		"static_data":   nil,
	}

	var _, insertErr = db.mongo.Collection("machines").InsertOne(c, machineDocument)
	if insertErr != nil {
		return nil, insertErr
	}

	return &SuccessfullMachineLogin{AccessToken: tokenString}, nil
}

func (db *Database) UpdateStaticData(c context.Context, uuid string, data MachineStaticData) {
	db.mongo.Collection("machines").UpdateOne(c, bson.M{"uuid": uuid}, bson.M{"$set": bson.M{"static_data": data}})
}

// Gets a machine from the database provider a bson filter for mongo
func (db *Database) GetMachine(c context.Context, filter bson.M) (*Machine, error) {
	var machine Machine
	var result = db.getDocument(c, "machines", filter)
	if err := result.Decode(&machine); err != nil {
		return nil, err
	}
	return &machine, nil
}

func (db *Database) DeleteMachine(c context.Context, filter bson.M) error {
	var _, err = db.mongo.Collection("machines").DeleteOne(c, filter)
	return err
}

// Gets a machine from the database by its uuid
func (db *Database) GetMachineByUuid(c context.Context, uuid string) (*Machine, error) {
	return db.GetMachine(c, bson.M{"uuid": uuid})
}

// Gets a machine from the database by its owner_uuid
func (db *Database) GetMachinesByOwnerUuid(c context.Context, ownerUuid string) (*[]Machine, error) {
	return db.GetMachines(c, bson.M{"owner_uuid": ownerUuid})
}

// Gets a machine from the database by its hostname
func (db *Database) GetMachineByHostname(c context.Context, hostname string) (*Machine, error) {
	return db.GetMachine(c, bson.M{"hostname": hostname})
}

// Gets all the machines from the database
func (db *Database) GetMachines(c context.Context, filter bson.M) (*[]Machine, error) {
	cursor, err := db.mongo.Collection("machines").Find(c, filter)
	if err != nil {
		return nil, err
	}

	// Prepare machines array
	var machines []Machine

	// Pass a pointer to the machines array for this dumb function to write the machines to
	if err := cursor.All(c, &machines); err != nil {
		return nil, err
	}

	// Return the machines
	return &machines, nil
}
