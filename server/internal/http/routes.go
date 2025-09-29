package http

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"example.com/server/internal/models"
)

func Register(app *fiber.App, db *gorm.DB) {
	api := app.Group("/api")

	// Healthcheck
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Auth handlers
	h := NewAuthHandler(db)
	api.Post("/auth/register", h.Register)
	api.Post("/auth/login", h.Login)
	api.Get("/me", h.RequireAuth, h.Me)

	// Optional users listing for debugging/admin
	api.Get("/users", func(c *fiber.Ctx) error {
		var users []models.User
		if err := db.Find(&users).Error; err != nil {
			return fiber.ErrInternalServerError
		}
		return c.JSON(users)
	})
}
