package v1

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/auth"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/errors"
	"github.com/xornet-cloud/Backend/types"
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

func (v1 V1) DeleteMachine(c *fiber.Ctx) error {
	var user = c.Locals("user").(*database.User)
	var targetMachineUuid = c.Params("uuid")
	var machine, err = v1.db.GetMachineByUuid(c.Context(), targetMachineUuid)
	if err != nil {
		return c.JSON(errors.ParamInvalidError)
	}

	if machine.OwnerUuid != user.Uuid {
		return c.JSON(errors.InsufficientPermissions)
	}

	var delErr = v1.db.DeleteMachine(c.Context(), bson.M{"uuid": machine.Uuid})
	if delErr != nil {
		return c.JSON(errors.DeletionFailure)
	}

	return c.JSON(types.GenericMessage{
		Message: "deleted successfully",
	})
}

func (v1 V1) SignupMachine(c *fiber.Ctx, km *auth.KeyManager) error {
	var user = c.Locals("user").(*database.User)
	var form = new(types.MachineSignupForm)
	if err := c.BodyParser(form); err != nil {
		return c.JSON(errors.FormInvalid)
	}

	var userUuidFromToken, uuidErr = km.Validate(form.TwoFactorKey)
	if userUuidFromToken == "" {
		return c.JSON(errors.KeyExpired)
	}
	if uuidErr != nil || userUuidFromToken != user.Uuid {
		return c.JSON(errors.KeyInvalid)
	}

	var machine, err = v1.db.CreateMachine(c.Context(), user.Uuid, *form)
	if err != nil {
		return c.JSON(errors.MachineCreationFailure)
	}

	return c.JSON(&machine)
}

func (v1 V1) GenerateSignupToken(c *fiber.Ctx, km *auth.KeyManager) error {
	var timestamp = time.Now().UnixMilli()
	var user = c.Locals("user").(*database.User)
	var key = km.Generate()
	km.Add(user.Uuid, key)
	return c.JSON(types.MachineSignupKey{
		Key:        key,
		Expiration: timestamp + 60*1000,
	})
}
