package database

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
)

// Gets a machine from the database provider a bson filter for mongo
func (db *Database) GetMachine(c context.Context, filter bson.M) (*Machine, error) {
	var machine Machine
	var result = db.getDocument(c, "machines", filter)
	if err := result.Decode(&machine); err != nil {
		return nil, err
	}
	return &machine, nil
}

// Gets a machine from the database by its uuid
func (db *Database) GetMachineByUuid(c context.Context, uuid string) (*Machine, error) {
	return db.GetMachine(c, bson.M{"uuid": uuid})
}

// Gets a machine from the database by its owner_uuid
func (db *Database) GetMachineByOwnerUuid(c context.Context, ownerUuid string) (*Machine, error) {
	return db.GetMachine(c, bson.M{"owner_uuid": ownerUuid})
}

// Gets a machine from the database by its hostname
func (db *Database) GetMachineByHostname(c context.Context, hostname string) (*Machine, error) {
	return db.GetMachine(c, bson.M{"hostname": hostname})
}

// Gets all the machines from the database
func (db *Database) GetMachinesAll(c context.Context) ([]Machine, error) {
	// Get all the machines from the database
	cursor, err := db.mongo.Collection("machines").Find(c, bson.D{})
	if err != nil {
		// if theres an error return it
		return nil, err
	}

	// Prepare machines array
	var machines []Machine

	// Pass a pointer to the machines array for this dumb function to write the machines to
	if err := cursor.All(c, &machines); err != nil {
		return nil, err
	}

	// Return the machines
	return machines, nil
}
