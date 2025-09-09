package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"example.com/server/internal/database"
	"example.com/server/internal/http"
	"example.com/server/internal/models"
)

func main() {
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}

	migrate(db)

	app := fiber.New()
	http.Register(app, db)

	addr := ":8080"
	log.Printf("server listening on %s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatal(err)
	}
}

func migrate(db *gorm.DB) {
	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatalf("migrate: %v", err)
	}
}
