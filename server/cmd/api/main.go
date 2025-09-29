package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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
	// Разрешаем CORS для фронтенда (по умолчанию все источники).
	app.Use(cors.New())

	http.Register(app, db)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
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
