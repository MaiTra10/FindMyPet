package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/MaiTra10/HackTheChange2025/backend/api/generic"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v5"
)

// =======================
// Data Models
// =======================

type SightingRequest struct {
	AnimalType  string  `json:"animalType"`
	Color       string  `json:"color"`
	Location    string  `json:"location"`
	DateSeen    string  `json:"dateSeen"`
	Description string  `json:"description"`
	ImageURL    *string `json:"imageURL,omitempty"`
	Contact     string  `json:"contact"`

	LocationCoords *struct {
		Lat float64 `json:"lat"`
		Lng float64 `json:"lng"`
	} `json:"locationCoords,omitempty"`
}

type SightingResponse struct {
	ID          string     `json:"id"`
	UserID      string     `json:"user_id"`
	Email       string     `json:"email"`
	AnimalType  string     `json:"animal_type"`
	Color       string     `json:"color"`
	Location    string     `json:"location"`
	Latitude    *float64   `json:"latitude"`
	Longitude   *float64   `json:"longitude"`
	DateSeen    time.Time  `json:"date_seen"`
	Description string     `json:"description"`
	ImageURL    *string    `json:"image_url"`
	Contact     string     `json:"contact"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

// =======================
// Custom Error Types
// =======================

type AuthError struct {
	Message string
	Err     error
}

func (e *AuthError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

type NotFoundError struct {
	Message string
}

func (e *NotFoundError) Error() string {
	return e.Message
}

type ValidationError struct {
	Message string
	Field   string
}

func (e *ValidationError) Error() string {
	return e.Message
}

// =======================
// Entry Point
// =======================

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Handle OPTIONS preflight requests
	if request.HTTPMethod == "OPTIONS" {
		return generic.Response(http.StatusOK, generic.Json{})
	}

	// Route based on HTTP method
	switch request.HTTPMethod {
	case "GET":
		return handleGet(request)
	case "POST":
		return handleCreate(request)
	case "PUT", "PATCH":
		return handleUpdate(request)
	case "DELETE":
		return handleDelete(request)
	default:
		return generic.Response(http.StatusMethodNotAllowed, generic.Json{
			"error": "method not allowed",
		})
	}
}

// =======================
// Helper Functions
// =======================

// Helper function to extract and validate JWT token
func extractUserFromToken(request events.APIGatewayProxyRequest) (string, string, error) {
	authHeader := request.Headers["Authorization"]
	if authHeader == "" {
		authHeader = request.Headers["authorization"]
	}
	if authHeader == "" {
		return "", "", &AuthError{Message: "missing authorization header"}
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	token = strings.TrimSpace(token)

	tokenClaims, err := generic.TokenClaims(token)
	if err != nil {
		return "", "", &AuthError{Message: "invalid or expired token", Err: err}
	}

	email, ok := tokenClaims["email"].(string)
	if !ok || email == "" {
		return "", "", &AuthError{Message: "email not found in token"}
	}

	return token, email, nil
}

// Helper function to get user UUID from email
func getUserUUID(ctx context.Context, conn *pgx.Conn, email string) (string, error) {
	var userUUID string
	queryUser := `SELECT id FROM users WHERE email = $1`
	err := conn.QueryRow(ctx, queryUser, email).Scan(&userUUID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", &NotFoundError{Message: "user not found"}
		}
		return "", err
	}
	return userUUID, nil
}

// Helper function to parse date with multiple format support
func parseDate(dateStr string) (time.Time, error) {
	dateFormats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02",
		time.RFC3339Nano,
	}

	for _, format := range dateFormats {
		if date, err := time.Parse(format, dateStr); err == nil {
			return date, nil
		}
	}

	return time.Time{}, &ValidationError{Message: "invalid date format", Field: "dateSeen"}
}

// =======================
// CREATE - POST /sighting-listing
// =======================

func handleCreate(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, email, err := extractUserFromToken(request)
	if err != nil {
		if authErr, ok := err.(*AuthError); ok {
			return generic.Response(http.StatusUnauthorized, generic.Json{
				"error": authErr.Message,
			})
		}
		return generic.Response(http.StatusUnauthorized, generic.Json{
			"error": err.Error(),
		})
	}

	var req SightingRequest
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error":   "invalid request body",
			"message": err.Error(),
		})
	}

	// Validate required fields
	if req.AnimalType == "" || req.Color == "" || req.Location == "" || req.DateSeen == "" || req.Contact == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "missing required fields: animalType, color, location, dateSeen, and contact are required",
		})
	}

	ctx := context.Background()
	conn, err := generic.SupabaseConnect()
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to connect to database",
			"message": err.Error(),
		})
	}
	defer conn.Close(ctx)

	userUUID, err := getUserUUID(ctx, conn, email)
	if err != nil {
		if _, ok := err.(*NotFoundError); ok {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": err.Error(),
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to query user",
			"message": err.Error(),
		})
	}

	dateSeen, err := parseDate(req.DateSeen)
	if err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": err.Error(),
		})
	}

	var lat, lng *float64
	if req.LocationCoords != nil {
		lat = &req.LocationCoords.Lat
		lng = &req.LocationCoords.Lng
	}

	insertQuery := `
		INSERT INTO sighting_listing (
			user_id, email, animal_type, color, location, latitude, longitude,
			date_seen, description, image_url, contact, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
		) RETURNING id
	`

	var sightingID string
	err = conn.QueryRow(
		ctx, insertQuery,
		userUUID, email, req.AnimalType, req.Color, req.Location, lat, lng,
		dateSeen, req.Description, req.ImageURL, req.Contact, time.Now(),
	).Scan(&sightingID)

	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to insert sighting listing",
			"message": err.Error(),
		})
	}

	return generic.Response(http.StatusCreated, generic.Json{
		"message": "Sighting listing created successfully",
		"id":      sightingID,
		"user_id": userUUID,
		"email":   email,
	})
}

// =======================
// READ - GET /sighting-listing or GET /sighting-listing/{id}
// =======================

func handleGet(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, email, err := extractUserFromToken(request)
	if err != nil {
		if authErr, ok := err.(*AuthError); ok {
			return generic.Response(http.StatusUnauthorized, generic.Json{
				"error": authErr.Message,
			})
		}
		return generic.Response(http.StatusUnauthorized, generic.Json{
			"error": err.Error(),
		})
	}

	ctx := context.Background()
	conn, err := generic.SupabaseConnect()
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to connect to database",
			"message": err.Error(),
		})
	}
	defer conn.Close(ctx)

	// Check if requesting specific ID
	sightingID := request.PathParameters["id"]
	if sightingID != "" {
		return getSightingByID(ctx, conn, sightingID)
	}

	// Get all sightings with optional filters
	return getAllSightings(ctx, conn, request.QueryStringParameters, email)
}

func getSightingByID(ctx context.Context, conn *pgx.Conn, id string) (events.APIGatewayProxyResponse, error) {
	query := `
		SELECT id, user_id, email, animal_type, color, location, latitude, longitude,
			date_seen, description, image_url, contact, created_at, updated_at
		FROM sighting_listing
		WHERE id = $1
	`

	var sighting SightingResponse
	var updatedAt *time.Time

	err := conn.QueryRow(ctx, query, id).Scan(
		&sighting.ID, &sighting.UserID, &sighting.Email, &sighting.AnimalType,
		&sighting.Color, &sighting.Location, &sighting.Latitude, &sighting.Longitude,
		&sighting.DateSeen, &sighting.Description, &sighting.ImageURL,
		&sighting.Contact, &sighting.CreatedAt, &updatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": "sighting listing not found",
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to query sighting listing",
			"message": err.Error(),
		})
	}

	sighting.UpdatedAt = updatedAt

	return generic.Response(http.StatusOK, generic.Json{
		"data": sighting,
	})
}

func getAllSightings(ctx context.Context, conn *pgx.Conn, queryParams map[string]string, email string) (events.APIGatewayProxyResponse, error) {
	// Build query with optional filters
	query := `
		SELECT id, user_id, email, animal_type, color, location, latitude, longitude,
			date_seen, description, image_url, contact, created_at, updated_at
		FROM sighting_listing
		WHERE 1=1
	`

	args := []interface{}{}
	argPos := 1

	// Filter by animal type
	if animalType, ok := queryParams["animalType"]; ok && animalType != "" {
		query += ` AND animal_type = $` + strconv.Itoa(argPos)
		args = append(args, animalType)
		argPos++
	}

	// Filter by user (optional - if "mine" is passed, show only user's sightings)
	if mine, ok := queryParams["mine"]; ok && mine == "true" {
		userUUID, err := getUserUUID(ctx, conn, email)
		if err != nil {
			return generic.Response(http.StatusInternalServerError, generic.Json{
				"error": "failed to get user",
			})
		}
		query += ` AND user_id = $` + strconv.Itoa(argPos)
		args = append(args, userUUID)
		argPos++
	}

	// Pagination
	limit := 50 // default
	if limitStr, ok := queryParams["limit"]; ok {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 && parsedLimit <= 100 {
			limit = parsedLimit
		}
	}

	offset := 0
	if offsetStr, ok := queryParams["offset"]; ok {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	query += ` ORDER BY created_at DESC LIMIT $` + strconv.Itoa(argPos) + ` OFFSET $` + strconv.Itoa(argPos+1)
	args = append(args, limit, offset)

	rows, err := conn.Query(ctx, query, args...)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to query sighting listings",
			"message": err.Error(),
		})
	}
	defer rows.Close()

	var sightings []SightingResponse
	for rows.Next() {
		var sighting SightingResponse
		var updatedAt *time.Time

		err := rows.Scan(
			&sighting.ID, &sighting.UserID, &sighting.Email, &sighting.AnimalType,
			&sighting.Color, &sighting.Location, &sighting.Latitude, &sighting.Longitude,
			&sighting.DateSeen, &sighting.Description, &sighting.ImageURL,
			&sighting.Contact, &sighting.CreatedAt, &updatedAt,
		)
		if err != nil {
			return generic.Response(http.StatusInternalServerError, generic.Json{
				"error":   "failed to scan sighting listing",
				"message": err.Error(),
			})
		}

		sighting.UpdatedAt = updatedAt
		sightings = append(sightings, sighting)
	}

	return generic.Response(http.StatusOK, generic.Json{
		"data":   sightings,
		"count":  len(sightings),
		"limit":  limit,
		"offset": offset,
	})
}

// =======================
// UPDATE - PUT/PATCH /sighting-listing/{id}
// =======================

func handleUpdate(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, email, err := extractUserFromToken(request)
	if err != nil {
		if authErr, ok := err.(*AuthError); ok {
			return generic.Response(http.StatusUnauthorized, generic.Json{
				"error": authErr.Message,
			})
		}
		return generic.Response(http.StatusUnauthorized, generic.Json{
			"error": err.Error(),
		})
	}

	sightingID := request.PathParameters["id"]
	if sightingID == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "sighting ID is required",
		})
	}

	var req SightingRequest
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error":   "invalid request body",
			"message": err.Error(),
		})
	}

	ctx := context.Background()
	conn, err := generic.SupabaseConnect()
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to connect to database",
			"message": err.Error(),
		})
	}
	defer conn.Close(ctx)

	userUUID, err := getUserUUID(ctx, conn, email)
	if err != nil {
		if _, ok := err.(*NotFoundError); ok {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": err.Error(),
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "failed to get user",
		})
	}

	// Verify ownership
	var ownerID string
	checkQuery := `SELECT user_id FROM sighting_listing WHERE id = $1`
	err = conn.QueryRow(ctx, checkQuery, sightingID).Scan(&ownerID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": "sighting listing not found",
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "failed to verify ownership",
		})
	}

	if ownerID != userUUID {
		return generic.Response(http.StatusForbidden, generic.Json{
			"error": "you do not have permission to update this sighting listing",
		})
	}

	// Build update query dynamically based on provided fields
	updateFields := []string{}
	args := []interface{}{}
	argPos := 1

	if req.AnimalType != "" {
		updateFields = append(updateFields, "animal_type = $"+strconv.Itoa(argPos))
		args = append(args, req.AnimalType)
		argPos++
	}
	if req.Color != "" {
		updateFields = append(updateFields, "color = $"+strconv.Itoa(argPos))
		args = append(args, req.Color)
		argPos++
	}
	if req.Location != "" {
		updateFields = append(updateFields, "location = $"+strconv.Itoa(argPos))
		args = append(args, req.Location)
		argPos++
	}
	if req.LocationCoords != nil {
		updateFields = append(updateFields, "latitude = $"+strconv.Itoa(argPos))
		args = append(args, req.LocationCoords.Lat)
		argPos++
		updateFields = append(updateFields, "longitude = $"+strconv.Itoa(argPos))
		args = append(args, req.LocationCoords.Lng)
		argPos++
	}
	if req.DateSeen != "" {
		dateSeen, err := parseDate(req.DateSeen)
		if err != nil {
			return generic.Response(http.StatusBadRequest, generic.Json{
				"error": err.Error(),
			})
		}
		updateFields = append(updateFields, "date_seen = $"+strconv.Itoa(argPos))
		args = append(args, dateSeen)
		argPos++
	}
	if req.Description != "" {
		updateFields = append(updateFields, "description = $"+strconv.Itoa(argPos))
		args = append(args, req.Description)
		argPos++
	}
	if req.ImageURL != nil {
		updateFields = append(updateFields, "image_url = $"+strconv.Itoa(argPos))
		args = append(args, req.ImageURL)
		argPos++
	}
	if req.Contact != "" {
		updateFields = append(updateFields, "contact = $"+strconv.Itoa(argPos))
		args = append(args, req.Contact)
		argPos++
	}

	if len(updateFields) == 0 {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "no fields to update",
		})
	}

	// Add updated_at
	updateFields = append(updateFields, "updated_at = $"+strconv.Itoa(argPos))
	args = append(args, time.Now())
	argPos++

	// Build final query with WHERE clause
	args = append(args, sightingID)
	updateQuery := `UPDATE sighting_listing SET ` + strings.Join(updateFields, ", ") + ` WHERE id = $` + strconv.Itoa(argPos)

	result, err := conn.Exec(ctx, updateQuery, args...)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to update sighting listing",
			"message": err.Error(),
		})
	}

	if result.RowsAffected() == 0 {
		return generic.Response(http.StatusNotFound, generic.Json{
			"error": "sighting listing not found",
		})
	}

	return generic.Response(http.StatusOK, generic.Json{
		"message": "Sighting listing updated successfully",
		"id":      sightingID,
	})
}

// =======================
// DELETE - DELETE /sighting-listing/{id}
// =======================

func handleDelete(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, email, err := extractUserFromToken(request)
	if err != nil {
		if authErr, ok := err.(*AuthError); ok {
			return generic.Response(http.StatusUnauthorized, generic.Json{
				"error": authErr.Message,
			})
		}
		return generic.Response(http.StatusUnauthorized, generic.Json{
			"error": err.Error(),
		})
	}

	sightingID := request.PathParameters["id"]
	if sightingID == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "sighting ID is required",
		})
	}

	ctx := context.Background()
	conn, err := generic.SupabaseConnect()
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to connect to database",
			"message": err.Error(),
		})
	}
	defer conn.Close(ctx)

	userUUID, err := getUserUUID(ctx, conn, email)
	if err != nil {
		if _, ok := err.(*NotFoundError); ok {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": err.Error(),
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "failed to get user",
		})
	}

	// Verify ownership
	var ownerID string
	checkQuery := `SELECT user_id FROM sighting_listing WHERE id = $1`
	err = conn.QueryRow(ctx, checkQuery, sightingID).Scan(&ownerID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": "sighting listing not found",
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "failed to verify ownership",
		})
	}

	if ownerID != userUUID {
		return generic.Response(http.StatusForbidden, generic.Json{
			"error": "you do not have permission to delete this sighting listing",
		})
	}

	// Delete the sighting
	deleteQuery := `DELETE FROM sighting_listing WHERE id = $1`
	result, err := conn.Exec(ctx, deleteQuery, sightingID)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to delete sighting listing",
			"message": err.Error(),
		})
	}

	if result.RowsAffected() == 0 {
		return generic.Response(http.StatusNotFound, generic.Json{
			"error": "sighting listing not found",
		})
	}

	return generic.Response(http.StatusOK, generic.Json{
		"message": "Sighting listing deleted successfully",
		"id":      sightingID,
	})
}
