package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/xornet-cloud/Backend/auth"
	"github.com/xornet-cloud/Backend/database"
	"github.com/xornet-cloud/Backend/errors"
)

func UserMiddleware(db *database.Database) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		// Get the headers from the requests
		headers := c.GetReqHeaders()

		// Remove the stupid 'Bearer ' thing from the start
		tokenString := strings.ReplaceAll(headers["Authorization"], "Bearer ", "")

		// If the header is literally empty then fuck them
		if tokenString == "" {
			return c.JSON(errors.UserNotAuthenticated)
		}

		// If it fails to get the token then return
		uuid, err := auth.GetUuidFromToken(tokenString)
		if err != nil {
			return c.JSON(errors.UserNotAuthenticated)
		}

		// Get the user from the database
		user, err := db.GetUserByUuid(c.Context(), uuid)

		// If they failed to be fetched from the database fuck them
		if err != nil {
			return c.JSON(errors.UserNotAuthenticated)
		}

		// attach the user to the local context for this request
		c.Locals("user", user)

		// continue the middleware
		return c.Next()
	}
}
