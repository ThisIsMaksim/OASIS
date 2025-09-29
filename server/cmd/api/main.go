package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	"example.com/server/internal/database"
	"example.com/server/internal/http"
)

func main() {
	m, err := database.Connect()
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}

	app := fiber.New()
	// Разрешаем CORS для фронтенда (по умолчанию все источники).
	app.Use(cors.New())

	http.Register(app, m.DB)

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
