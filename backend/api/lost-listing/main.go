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
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type LostPetRequest struct {
	Name       string   `json:"name"`
	AnimalType string   `json:"animalType"`
	Gender     *string  `json:"gender,omitempty"`
	Breed      []string `json:"breed,omitempty"` // Array
	Color      []string `json:"color"`           // Array
	Age        *string  `json:"age,omitempty"`
	DateLost   string   `json:"dateLost"`
	Location   string   `json:"location"`
	PostalCode *string  `json:"postalCode,omitempty"`

	LocationCoords *struct {
		Lat float64 `json:"lat"`
		Lng float64 `json:"lng"`
	} `json:"locationCoords,omitempty"`

	Description string  `json:"description"`
	PetID       *string `json:"petId,omitempty"`
	IsFound     *bool   `json:"isFound,omitempty"`
}

type LostPetResponse struct {
	ID               int        `json:"id"`
	ListingOwner     string     `json:"listing_owner"`
	IsFound          bool       `json:"is_found"`
	DateFound        *time.Time `json:"date_found,omitempty"`
	PetName          string     `json:"pet_name"`
	PetID            *string    `json:"pet_id,omitempty"`
	Gender           *string    `json:"gender,omitempty"`
	Breed            []string   `json:"breed,omitempty"`
	Color            []string   `json:"color"`
	AnimalType       string     `json:"animal_type"`
	Age              *string    `json:"age,omitempty"`
	Description      string     `json:"description"`
	ImageURLs        []string   `json:"image_urls,omitempty"`
	DateLost         time.Time  `json:"date_lost"`
	LastSeenLocation int        `json:"last_seen_location"`
	Location         *Location  `json:"location,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
}

type Location struct {
	ID            int     `json:"id"`
	StreetAddress string  `json:"street_address"`
	PostalCode    *string `json:"postal_code,omitempty"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	CityID        *int    `json:"city_id,omitempty"`
}

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return generic.Response(http.StatusOK, generic.Json{})
	}

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

func getUserUUID(ctx context.Context, conn *pgx.Conn, email string) (string, error) {
	var userUUID string
	queryUser := `SELECT user_uuid FROM users WHERE email = $1`
	err := conn.QueryRow(ctx, queryUser, email).Scan(&userUUID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", &NotFoundError{Message: "user not found"}
		}
		return "", err
	}
	return userUUID, nil
}

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

	return time.Time{}, &ValidationError{Message: "invalid date format", Field: "dateLost"}
}

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

// Helper to create or get location ID
func getOrCreateLocation(ctx context.Context, conn *pgx.Conn, streetAddress string, postalCode *string, lat, lng float64) (int, error) {
	// First try to find existing location
	var locationID int
	query := `SELECT id FROM locations WHERE street_address = $1 AND latitude = $2 AND longitude = $3 LIMIT 1`
	err := conn.QueryRow(ctx, query, streetAddress, lat, lng).Scan(&locationID)
	if err == nil {
		return locationID, nil
	}
	if err != pgx.ErrNoRows {
		return 0, err
	}

	// Create new location (city_id is optional, can be NULL)
	insertQuery := `INSERT INTO locations (street_address, postal_code, latitude, longitude, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id`
	err = conn.QueryRow(ctx, insertQuery, streetAddress, postalCode, lat, lng, time.Now()).Scan(&locationID)
	if err != nil {
		return 0, err
	}
	return locationID, nil
}

// CREATE - POST /lost-listing
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

	var req LostPetRequest
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error":   "invalid request body",
			"message": err.Error(),
		})
	}

	// Validate required fields
	if req.Name == "" || req.AnimalType == "" || len(req.Color) == 0 || req.DateLost == "" || req.Location == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "missing required fields: name, animalType, color, dateLost, and location are required",
		})
	}

	if req.LocationCoords == nil {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "locationCoords (lat, lng) are required",
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

	dateLost, err := parseDate(req.DateLost)
	if err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": err.Error(),
		})
	}

	// Create or get location
	locationID, err := getOrCreateLocation(ctx, conn, req.Location, req.PostalCode, req.LocationCoords.Lat, req.LocationCoords.Lng)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to create location",
			"message": err.Error(),
		})
	}

	// Convert userUUID string to UUID type
	userUUIDParsed, err := uuid.Parse(userUUID)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "invalid user UUID format",
		})
	}

	insertQuery := `
		INSERT INTO lost_pet_listing (
			listing_owner, is_found, pet_name, pet_id, gender, breed, color,
			animal_type, age, description, date_lost, last_seen_location, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		) RETURNING id
	`

	var listingID int
	err = conn.QueryRow(
		ctx, insertQuery,
		userUUIDParsed,  // listing_owner (UUID)
		false,           // is_found (default false)
		req.Name,        // pet_name
		req.PetID,       // pet_id (nullable)
		req.Gender,      // gender (nullable)
		req.Breed,       // breed (array, nullable)
		req.Color,       // color (array)
		req.AnimalType,  // animal_type
		req.Age,         // age (nullable)
		req.Description, // description
		dateLost,        // date_lost
		locationID,      // last_seen_location
		time.Now(),      // created_at
	).Scan(&listingID)

	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to insert lost pet listing",
			"message": err.Error(),
		})
	}

	return generic.Response(http.StatusCreated, generic.Json{
		"message":   "Lost pet listing created successfully",
		"id":        listingID,
		"user_uuid": userUUID,
	})
}

// READ - GET /lost-listing or GET /lost-listing/{id}
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

	listingID := request.PathParameters["id"]
	if listingID != "" {
		return getLostPetByID(ctx, conn, listingID, email)
	}

	return getAllLostPets(ctx, conn, request.QueryStringParameters, email)
}

func getLostPetByID(ctx context.Context, conn *pgx.Conn, id, email string) (events.APIGatewayProxyResponse, error) {
	query := `
		SELECT 
			l.id, l.listing_owner, l.is_found, l.date_found, l.pet_name, l.pet_id,
			l.gender, l.breed, l.color, l.animal_type, l.age, l.description,
			l.image_urls, l.date_lost, l.last_seen_location, l.created_at,
			loc.id, loc.street_address, loc.postal_code, loc.latitude, loc.longitude, loc.city_id
		FROM lost_pet_listing l
		LEFT JOIN locations loc ON l.last_seen_location = loc.id
		WHERE l.id = $1
	`

	var pet LostPetResponse
	var location Location
	var dateFound *time.Time

	err := conn.QueryRow(ctx, query, id).Scan(
		&pet.ID, &pet.ListingOwner, &pet.IsFound, &dateFound, &pet.PetName, &pet.PetID,
		&pet.Gender, &pet.Breed, &pet.Color, &pet.AnimalType, &pet.Age, &pet.Description,
		&pet.ImageURLs, &pet.DateLost, &pet.LastSeenLocation, &pet.CreatedAt,
		&location.ID, &location.StreetAddress, &location.PostalCode, &location.Latitude, &location.Longitude, &location.CityID,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": "lost pet listing not found",
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to query lost pet listing",
			"message": err.Error(),
		})
	}

	pet.DateFound = dateFound
	pet.Location = &location

	return generic.Response(http.StatusOK, generic.Json{
		"data": pet,
	})
}

func getAllLostPets(ctx context.Context, conn *pgx.Conn, queryParams map[string]string, email string) (events.APIGatewayProxyResponse, error) {
	query := `
		SELECT 
			l.id, l.listing_owner, l.is_found, l.date_found, l.pet_name, l.pet_id,
			l.gender, l.breed, l.color, l.animal_type, l.age, l.description,
			l.image_urls, l.date_lost, l.last_seen_location, l.created_at
		FROM lost_pet_listing l
		WHERE 1=1
	`

	args := []interface{}{}
	argPos := 1

	// Filter by is_found
	if isFound, ok := queryParams["isFound"]; ok && isFound != "" {
		isFoundBool, err := strconv.ParseBool(isFound)
		if err == nil {
			query += ` AND l.is_found = $` + strconv.Itoa(argPos)
			args = append(args, isFoundBool)
			argPos++
		}
	}

	// Filter by animal type
	if animalType, ok := queryParams["animalType"]; ok && animalType != "" {
		query += ` AND l.animal_type = $` + strconv.Itoa(argPos)
		args = append(args, animalType)
		argPos++
	}

	// Filter by user
	if mine, ok := queryParams["mine"]; ok && mine == "true" {
		userUUID, err := getUserUUID(ctx, conn, email)
		if err != nil {
			return generic.Response(http.StatusInternalServerError, generic.Json{
				"error": "failed to get user",
			})
		}
		query += ` AND l.listing_owner = $` + strconv.Itoa(argPos)
		args = append(args, userUUID)
		argPos++
	}

	// Pagination
	limit := 50
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

	query += ` ORDER BY l.created_at DESC LIMIT $` + strconv.Itoa(argPos) + ` OFFSET $` + strconv.Itoa(argPos+1)
	args = append(args, limit, offset)

	rows, err := conn.Query(ctx, query, args...)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to query lost pet listings",
			"message": err.Error(),
		})
	}
	defer rows.Close()

	var pets []LostPetResponse
	for rows.Next() {
		var pet LostPetResponse
		var dateFound *time.Time

		err := rows.Scan(
			&pet.ID, &pet.ListingOwner, &pet.IsFound, &dateFound, &pet.PetName, &pet.PetID,
			&pet.Gender, &pet.Breed, &pet.Color, &pet.AnimalType, &pet.Age, &pet.Description,
			&pet.ImageURLs, &pet.DateLost, &pet.LastSeenLocation, &pet.CreatedAt,
		)
		if err != nil {
			return generic.Response(http.StatusInternalServerError, generic.Json{
				"error":   "failed to scan lost pet listing",
				"message": err.Error(),
			})
		}

		pet.DateFound = dateFound
		pets = append(pets, pet)
	}

	return generic.Response(http.StatusOK, generic.Json{
		"data":   pets,
		"count":  len(pets),
		"limit":  limit,
		"offset": offset,
	})
}

// UPDATE - PUT/PATCH /lost-listing/{id}
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

	listingID := request.PathParameters["id"]
	if listingID == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "listing ID is required",
		})
	}

	var req LostPetRequest
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
	checkQuery := `SELECT listing_owner FROM lost_pet_listing WHERE id = $1`
	err = conn.QueryRow(ctx, checkQuery, listingID).Scan(&ownerID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": "lost pet listing not found",
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "failed to verify ownership",
		})
	}

	if ownerID != userUUID {
		return generic.Response(http.StatusForbidden, generic.Json{
			"error": "you do not have permission to update this listing",
		})
	}

	// Build update query dynamically
	updateFields := []string{}
	args := []interface{}{}
	argPos := 1

	if req.Name != "" {
		updateFields = append(updateFields, "pet_name = $"+strconv.Itoa(argPos))
		args = append(args, req.Name)
		argPos++
	}
	if req.AnimalType != "" {
		updateFields = append(updateFields, "animal_type = $"+strconv.Itoa(argPos))
		args = append(args, req.AnimalType)
		argPos++
	}
	if req.Gender != nil {
		updateFields = append(updateFields, "gender = $"+strconv.Itoa(argPos))
		args = append(args, req.Gender)
		argPos++
	}
	if req.Breed != nil && len(req.Breed) > 0 {
		updateFields = append(updateFields, "breed = $"+strconv.Itoa(argPos))
		args = append(args, req.Breed)
		argPos++
	}
	if req.Color != nil && len(req.Color) > 0 {
		updateFields = append(updateFields, "color = $"+strconv.Itoa(argPos))
		args = append(args, req.Color)
		argPos++
	}
	if req.Age != nil {
		updateFields = append(updateFields, "age = $"+strconv.Itoa(argPos))
		args = append(args, req.Age)
		argPos++
	}
	if req.DateLost != "" {
		dateLost, err := parseDate(req.DateLost)
		if err != nil {
			return generic.Response(http.StatusBadRequest, generic.Json{
				"error": err.Error(),
			})
		}
		updateFields = append(updateFields, "date_lost = $"+strconv.Itoa(argPos))
		args = append(args, dateLost)
		argPos++
	}
	if req.Description != "" {
		updateFields = append(updateFields, "description = $"+strconv.Itoa(argPos))
		args = append(args, req.Description)
		argPos++
	}
	if req.PetID != nil {
		updateFields = append(updateFields, "pet_id = $"+strconv.Itoa(argPos))
		args = append(args, req.PetID)
		argPos++
	}
	if req.IsFound != nil {
		updateFields = append(updateFields, "is_found = $"+strconv.Itoa(argPos))
		args = append(args, *req.IsFound)
		argPos++
		if *req.IsFound {
			updateFields = append(updateFields, "date_found = $"+strconv.Itoa(argPos))
			args = append(args, time.Now())
			argPos++
		}
	}
	if req.Location != "" && req.LocationCoords != nil {
		locationID, err := getOrCreateLocation(ctx, conn, req.Location, req.PostalCode, req.LocationCoords.Lat, req.LocationCoords.Lng)
		if err != nil {
			return generic.Response(http.StatusInternalServerError, generic.Json{
				"error": "failed to update location",
			})
		}
		updateFields = append(updateFields, "last_seen_location = $"+strconv.Itoa(argPos))
		args = append(args, locationID)
		argPos++
	}

	if len(updateFields) == 0 {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "no fields to update",
		})
	}

	args = append(args, listingID)
	updateQuery := `UPDATE lost_pet_listing SET ` + strings.Join(updateFields, ", ") + ` WHERE id = $` + strconv.Itoa(argPos)

	result, err := conn.Exec(ctx, updateQuery, args...)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to update lost pet listing",
			"message": err.Error(),
		})
	}

	if result.RowsAffected() == 0 {
		return generic.Response(http.StatusNotFound, generic.Json{
			"error": "lost pet listing not found",
		})
	}

	return generic.Response(http.StatusOK, generic.Json{
		"message": "Lost pet listing updated successfully",
		"id":      listingID,
	})
}

// DELETE - DELETE /lost-listing/{id}
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

	listingID := request.PathParameters["id"]
	if listingID == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "listing ID is required",
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
	checkQuery := `SELECT listing_owner FROM lost_pet_listing WHERE id = $1`
	err = conn.QueryRow(ctx, checkQuery, listingID).Scan(&ownerID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return generic.Response(http.StatusNotFound, generic.Json{
				"error": "lost pet listing not found",
			})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "failed to verify ownership",
		})
	}

	if ownerID != userUUID {
		return generic.Response(http.StatusForbidden, generic.Json{
			"error": "you do not have permission to delete this listing",
		})
	}

	deleteQuery := `DELETE FROM lost_pet_listing WHERE id = $1`
	result, err := conn.Exec(ctx, deleteQuery, listingID)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to delete lost pet listing",
			"message": err.Error(),
		})
	}

	if result.RowsAffected() == 0 {
		return generic.Response(http.StatusNotFound, generic.Json{
			"error": "lost pet listing not found",
		})
	}

	return generic.Response(http.StatusOK, generic.Json{
		"message": "Lost pet listing deleted successfully",
		"id":      listingID,
	})
}
