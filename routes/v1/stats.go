package v1

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/logic"
	"github.com/xornet-cloud/Backend/types"
)

func (v1 V1) Ping(c *fiber.Ctx) error {
	return c.Send(nil)
}

func (v1 V1) Status(c *fiber.Ctx) error {
	return c.JSON(types.BackendStatus{
		MemoryUsage: logic.GetMemoryUsage(),
	})
}
