package http

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"example.com/server/internal/models"
)

func Register(app *fiber.App, db *gorm.DB) {
	api := app.Group("/api")

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	api.Get("/users", func(c *fiber.Ctx) error {
		var users []models.User
		if err := db.Find(&users).Error; err != nil {
			return fiber.ErrInternalServerError
		}
		return c.JSON(users)
	})

	api.Post("/users", func(c *fiber.Ctx) error {
		var in models.User
		if err := c.BodyParser(&in); err != nil {
			return fiber.ErrBadRequest
		}
		in.ID = 0
		if err := db.Create(&in).Error; err != nil {
			return fiber.ErrInternalServerError
		}
		return c.Status(fiber.StatusCreated).JSON(in)
	})

	api.Get("/users/:id", func(c *fiber.Ctx) error {
		var user models.User
		if err := db.First(&user, "id = ?", c.Params("id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fiber.ErrNotFound
			}
			return fiber.ErrInternalServerError
		}
		return c.JSON(user)
	})

	api.Put("/users/:id", func(c *fiber.Ctx) error {
		var user models.User
		if err := db.First(&user, "id = ?", c.Params("id")).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fiber.ErrNotFound
			}
			return fiber.ErrInternalServerError
		}
		var in models.User
		if err := c.BodyParser(&in); err != nil {
			return fiber.ErrBadRequest
		}
		user.Name = in.Name
		user.Email = in.Email
		if err := db.Save(&user).Error; err != nil {
			return fiber.ErrInternalServerError
		}
		return c.JSON(user)
	})

	api.Delete("/users/:id", func(c *fiber.Ctx) error {
		if err := db.Delete(&models.User{}, "id = ?", c.Params("id")).Error; err != nil {
			return fiber.ErrInternalServerError
		}
		return c.SendStatus(fiber.StatusNoContent)
	})
}
