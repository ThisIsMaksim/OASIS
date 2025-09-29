package http

import (
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"

	"example.com/server/internal/database"
	"example.com/server/internal/models"
)

func Register(app *fiber.App, db *mongo.Database) {
	api := app.Group("/api")

	// Healthcheck
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Auth handlers
	mongoDB, err := database.Connect()
	if err != nil {
		panic("Failed to connect to MongoDB")
	}
	h := NewAuthHandler(mongoDB)
	api.Post("/auth/register", h.Register)
	api.Post("/auth/login", h.Login)
	api.Get("/me", h.RequireAuth, h.Me)

	// Optional users listing for debugging/admin
	api.Get("/users", func(c *fiber.Ctx) error {
		var users []models.User
		cursor, err := db.Collection("users").Find(c.Context(), map[string]interface{}{})
		if err != nil {
			return fiber.ErrInternalServerError
		}
		if err := cursor.All(c.Context(), &users); err != nil {
			return fiber.ErrInternalServerError
		}
		return c.JSON(users)
	})
}
