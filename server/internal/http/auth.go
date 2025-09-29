package http

import (
	"example.com/server/internal/database"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"example.com/server/internal/models"
)

type AuthHandler struct {
	db     *database.Mongo
	secret []byte
	ttl    time.Duration
}

func NewAuthHandler(db *database.Mongo) *AuthHandler {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-change-me"
	}
	ttl := 24 * time.Hour
	if v := os.Getenv("JWT_TTL_HOURS"); v != "" {
		if h, err := strconv.Atoi(v); err == nil && h > 0 {
			ttl = time.Duration(h) * time.Hour
		}
	}
	return &AuthHandler{db: db, secret: []byte(secret), ttl: ttl}
}

type registerRequest struct {
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	AvatarURL string `json:"avatarUrl"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func normalizeEmail(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req registerRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	req.Email = normalizeEmail(req.Email)
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "name, email and password are required")
	}
	var existing models.User
	if err := h.db.Users.FindOne(c.Context(), map[string]interface{}{"email": req.Email}).Decode(&existing); err == nil {
		return fiber.NewError(fiber.StatusConflict, "email already in use")
	} else if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "hash error")
	}
	user := models.User{
		Name:         req.Name,
		Email:        req.Email,
		AvatarURL:    strings.TrimSpace(req.AvatarURL),
		PasswordHash: string(hash),
	}
	if _, err := h.db.Users.InsertOne(c.Context(), user); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	token, err := h.makeToken(user.ID.Hex())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "token error")
	}
	return c.Status(fiber.StatusCreated).JSON(authResponse{Token: token, User: user})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req loginRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid payload")
	}
	email := normalizeEmail(req.Email)
	if email == "" || req.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email and password are required")
	}
	var user models.User
	if err := h.db.Users.FindOne(c.Context(), map[string]interface{}{"email": email}).Decode(&user); err != nil {
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid credentials")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid credentials")
	}
	token, err := h.makeToken(user.ID.Hex())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "token error")
	}
	return c.JSON(authResponse{Token: token, User: user})
}

func (h *AuthHandler) RequireAuth(c *fiber.Ctx) error {
	auth := c.Get("Authorization")
	if auth == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing Authorization header")
	}
	parts := strings.SplitN(auth, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid Authorization header")
	}
	tokenStr := parts[1]
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.ErrUnauthorized
		}
		return h.secret, nil
	})
	if err != nil || !token.Valid {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid token")
	}
	if claims.Subject == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid token subject")
	}
	uid64, err := strconv.ParseUint(claims.Subject, 10, 64)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid token subject")
	}
	var user models.User
	if err := h.db.Users.FindOne(c.Context(), map[string]interface{}{"_id": uid64}).Decode(&user); err != nil {
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "user not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db error")
	}
	c.Locals("user", &user)
	return c.Next()
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(*models.User)
	if !ok || user == nil {
		return fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
	}
	return c.JSON(user)
}

func (h *AuthHandler) makeToken(uid string) (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   uid,
		ExpiresAt: jwt.NewNumericDate(now.Add(h.ttl)),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.secret)
}
