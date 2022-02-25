package v1

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

func (v1 V1) GetMachinesAll(c *fiber.Ctx) error {
	machines, err := v1.db.GetMachines(c.Context(), bson.M{})
	if err != nil {
		return err
	}
	return c.JSON(&machines)
}

func (v1 V1) GetMachineByUuid(c *fiber.Ctx) error {
	return v1.getDocByFieldFromParam(c, "machines", "uuid")
}

func (v1 V1) GetMachineByHostname(c *fiber.Ctx) error {
	return v1.getDocByFieldFromParam(c, "machines", "hostname")
}

func (v1 V1) GetMachineByOwner(c *fiber.Ctx) error {
	return v1.getDocByFieldFromParam(c, "machines", "owner")
}
