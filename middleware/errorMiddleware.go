package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/errors"
)

func ErrorHandlerMiddleware(c *fiber.Ctx) error {
	err := c.Next()
	if err != nil {
		if err, ok := err.(errors.ApiError); ok {
			return c.Status(int(err.Status)).JSON(&fiber.Map{
				"message": err.Name,
			})
		}
		return c.Status(500).JSON(&fiber.Map{
			"message": "trollface event happened",
			"error":   err.Error(),
		})
	}
	return err
}
