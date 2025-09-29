package database

import (
	"context"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Mongo struct {
	Client *mongo.Client
	DB     *mongo.Database
	Users  *mongo.Collection
}

func Connect() (*Mongo, error) {
	_ = godotenv.Load()

	uri := getEnv("MONGO_URI", "mongodb://localhost:27017")
	dbname := getEnv("MONGO_DB", "appdb")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Проверка соединения
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	db := client.Database(dbname)
	m := &Mongo{
		Client: client,
		DB:     db,
		Users:  db.Collection("users"),
	}

	// Индексы
	if err := ensureIndexes(ctx, m); err != nil {
		return nil, err
	}

	return m, nil
}

func ensureIndexes(ctx context.Context, m *Mongo) error {
	// Уникальный индекс на email
	_, err := m.Users.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true).SetName("uniq_email"),
	})
	return err
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

