package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/MaiTra10/HackTheChange2025/backend/api/generic"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/api/idtoken"
)

// Request body structure
type GoogleLoginRequest struct {
	Token string `json:"token"`
}

func main() {

	lambda.Start(handler)

}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Handle OPTIONS preflight requests
	if request.HTTPMethod == "OPTIONS" {
		return generic.Response(http.StatusOK, generic.Json{})
	}
	// Parse JSON body
	var req GoogleLoginRequest
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		return generic.Response(201, generic.Json{"error": "invalid request body"})
	}
	// Validate Google ID token
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	payload, err := idtoken.Validate(context.Background(), req.Token, clientID)
	if err != nil {
		return generic.Response(202, generic.Json{"error": "invalid Google token", "message": err.Error()})
	}
	// Extract user info from claims
	email := payload.Claims["email"].(string)
	name := payload.Claims["name"].(string)
	picture := payload.Claims["picture"].(string)
	// Upsert user in Supabase (placeholder)
	if err := upsertUserInSupabase(email, name, picture); err != nil {
		return generic.Response(203, generic.Json{"error": "failed to upsert user", "message": err.Error()})
	}
	// Generate app JWT
	token, err := generateJWT(email, name, picture)
	if err != nil {
		return generic.Response(204, generic.Json{"error": "failed to generate token"})
	}
	// Return success response
	return generic.Response(http.StatusOK, generic.Json{
		"message": "Login successful",
		"token":   token,
	})
}

func upsertUserInSupabase(email, name, picture string) error {
	ctx := context.Background()
	conn, err := generic.SupabaseConnect()
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	query := `
		INSERT INTO users (email, name, picture)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO NOTHING;
	`

	_, err = conn.Exec(ctx, query, email, name, picture)
	return err
}

// Generate your app’s JWT token
func generateJWT(email string, name string, picture string) (string, error) {
	secret := os.Getenv("JWT_SECRET")

	claims := jwt.MapClaims{
		"email":   email,
		"name":    name,
		"picture": picture,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
