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

type SightingRequest struct {
	PetName     *string  `json:"petName,omitempty"`
	PetID       *string  `json:"petId,omitempty"`
	AnimalType  string   `json:"animalType"`
	Gender      *string  `json:"gender,omitempty"`
	Breed       []string `json:"breed,omitempty"`
	Color       []string `json:"color"`
	Description string   `json:"description,omitempty"`
	DateSpotted string   `json:"dateSpotted"`
	Location    string   `json:"location"`

	LocationCoords *struct {
		Lat float64 `json:"lat"`
		Lng float64 `json:"lng"`
	} `json:"locationCoords,omitempty"`

	City            string  `json:"city"`
	ProvinceOrState string  `json:"provinceOrState"`
	Country         string  `json:"country"`
	PostalCode      *string `json:"postalCode,omitempty"`

	IsFound *bool `json:"isFound,omitempty"`
}

type SightingResponse struct {
	ID              int        `json:"id"`
	ListingOwner    string     `json:"listing_owner"`
	IsFound         bool       `json:"is_found"`
	DateFound       *time.Time `json:"date_found,omitempty"`
	PetName         *string    `json:"pet_name,omitempty"`
	PetID           *string    `json:"pet_id,omitempty"`
	Gender          *string    `json:"gender,omitempty"`
	Breed           []string   `json:"breed,omitempty"`
	Color           []string   `json:"color"`
	AnimalType      string     `json:"animal_type"`
	Description     string     `json:"description,omitempty"`
	ImageURLs       []string   `json:"image_urls,omitempty"`
	DateSpotted     time.Time  `json:"date_spotted"`
	SpottedLocation int        `json:"spotted_location"`
	Location        *Location  `json:"location,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
}

type Location struct {
	ID            int     `json:"id"`
	StreetAddress string  `json:"street_address"`
	PostalCode    *string `json:"postal_code"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	CityID        *int    `json:"city_id,omitempty"`
}

// Error types
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

// Helper functions
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

// GetUserUUID is an alias for getUserUUID (for compatibility)
func GetUserUUID(ctx context.Context, conn *pgx.Conn, email string) (string, error) {
	return getUserUUID(ctx, conn, email)
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

	return time.Time{}, &ValidationError{Message: "invalid date format", Field: "dateSpotted"}
}

func getOrCreateCity(ctx context.Context, conn *pgx.Conn, cityName, province, country string) (*int, error) {
	var cityID int
	query := `SELECT id FROM cities WHERE city_name = $1 AND province_or_state = $2 AND country = $3 LIMIT 1`
	err := conn.QueryRow(ctx, query, cityName, province, country).Scan(&cityID)
	if err == nil {
		return &cityID, nil
	}
	if err != pgx.ErrNoRows {
		return nil, err
	}

	insertQuery := `INSERT INTO cities (city_name, province_or_state, country) VALUES ($1, $2, $3) RETURNING id`
	err = conn.QueryRow(ctx, insertQuery, cityName, province, country).Scan(&cityID)
	if err != nil {
		return nil, err
	}

	return &cityID, nil
}

func getOrCreateLocation(ctx context.Context, conn *pgx.Conn, streetAddress string, postalCode *string, lat, lng float64, cityID *int) (int, error) {
	var locationID int
	query := `SELECT id FROM locations WHERE street_address = $1 AND latitude = $2 AND longitude = $3 LIMIT 1`
	err := conn.QueryRow(ctx, query, streetAddress, lat, lng).Scan(&locationID)
	if err == nil {
		return locationID, nil
	}
	if err != pgx.ErrNoRows {
		return 0, err
	}

	insertQuery := `INSERT INTO locations (street_address, postal_code, latitude, longitude, city_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	err = conn.QueryRow(ctx, insertQuery, streetAddress, postalCode, lat, lng, cityID, time.Now()).Scan(&locationID)
	if err != nil {
		return 0, err
	}
	return locationID, nil
}

func getAllSightings(ctx context.Context, conn *pgx.Conn, queryParams map[string]string, email string) (events.APIGatewayProxyResponse, error) {
	query := `
		SELECT 
			s.id, s.listing_owner, s.is_found, s.date_found, s.pet_name, s.pet_id,
			s.gender, s.breed, s.color, s.animal_type, s.description,
			s.image_urls, s.date_spotted, s.spotted_location, s.created_at
		FROM sighting_listing s
		WHERE 1=1
	`

	args := []interface{}{}
	argPos := 1

	// Filter by animal type
	if animalType, ok := queryParams["animalType"]; ok && animalType != "" {
		query += ` AND s.animal_type = $` + strconv.Itoa(argPos)
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
		query += ` AND s.listing_owner = $` + strconv.Itoa(argPos)
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

	query += ` ORDER BY s.created_at DESC LIMIT $` + strconv.Itoa(argPos) + ` OFFSET $` + strconv.Itoa(argPos+1)
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
		var dateFound *time.Time

		err := rows.Scan(
			&sighting.ID, &sighting.ListingOwner, &sighting.IsFound, &dateFound, &sighting.PetName, &sighting.PetID,
			&sighting.Gender, &sighting.Breed, &sighting.Color, &sighting.AnimalType, &sighting.Description,
			&sighting.ImageURLs, &sighting.DateSpotted, &sighting.SpottedLocation, &sighting.CreatedAt,
		)
		if err != nil {
			return generic.Response(http.StatusInternalServerError, generic.Json{
				"error":   "failed to scan sighting listing",
				"message": err.Error(),
			})
		}

		sighting.DateFound = dateFound
		sightings = append(sightings, sighting)
	}

	return generic.Response(http.StatusOK, generic.Json{
		"data":   sightings,
		"count":  len(sightings),
		"limit":  limit,
		"offset": offset,
	})
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

// ------------------ CREATE ------------------
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

	if req.AnimalType == "" || req.DateSpotted == "" || req.Location == "" || len(req.Color) == 0 {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "missing required fields: animalType, color, dateSpotted, location",
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
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to get user"})
	}

	dateSpotted, err := parseDate(req.DateSpotted)
	if err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{"error": err.Error()})
	}

	cityID, err := getOrCreateCity(ctx, conn, req.City, req.ProvinceOrState, req.Country)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to create or fetch city"})
	}

	locationID, err := getOrCreateLocation(ctx, conn, req.Location, req.PostalCode, req.LocationCoords.Lat, req.LocationCoords.Lng, cityID)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to create location"})
	}

	userUUIDParsed, _ := uuid.Parse(userUUID)

	insertQuery := `
		INSERT INTO sighting_listing (
			listing_owner, is_found, pet_name, pet_id, gender, breed, color,
			animal_type, description, date_spotted, spotted_location, created_at
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
		) RETURNING id
	`

	var sightingID int
	err = conn.QueryRow(ctx, insertQuery,
		userUUIDParsed,
		false,
		req.PetName,
		req.PetID,
		req.Gender,
		req.Breed,
		req.Color,
		req.AnimalType,
		req.Description,
		dateSpotted,
		locationID,
		time.Now(),
	).Scan(&sightingID)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to insert sighting", "message": err.Error()})
	}

	return generic.Response(http.StatusCreated, generic.Json{"message": "Sighting created", "id": sightingID})
}

// ------------------ READ ------------------
func handleGet(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, email, err := extractUserFromToken(request)
	if err != nil {
		return generic.Response(http.StatusUnauthorized, generic.Json{"error": err.Error()})
	}

	ctx := context.Background()
	conn, err := generic.SupabaseConnect()
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to connect to database"})
	}
	defer conn.Close(ctx)

	listingID := request.PathParameters["id"]
	if listingID != "" {
		return getSightingByID(ctx, conn, listingID)
	}
	return getAllSightings(ctx, conn, request.QueryStringParameters, email)
}

func getSightingByID(ctx context.Context, conn *pgx.Conn, id string) (events.APIGatewayProxyResponse, error) {
	query := `
		SELECT
			s.id, s.listing_owner, s.is_found, s.date_found, s.pet_name, s.pet_id,
			s.gender, s.breed, s.color, s.animal_type, s.description,
			s.image_urls, s.date_spotted, s.spotted_location, s.created_at,
			loc.id, loc.street_address, loc.postal_code, loc.latitude, loc.longitude, loc.city_id
		FROM sighting_listing s
		LEFT JOIN locations loc ON s.spotted_location = loc.id
		WHERE s.id = $1
	`

	var sighting SightingResponse
	var location Location
	var dateFound *time.Time

	err := conn.QueryRow(ctx, query, id).Scan(
		&sighting.ID, &sighting.ListingOwner, &sighting.IsFound, &dateFound, &sighting.PetName, &sighting.PetID,
		&sighting.Gender, &sighting.Breed, &sighting.Color, &sighting.AnimalType, &sighting.Description,
		&sighting.ImageURLs, &sighting.DateSpotted, &sighting.SpottedLocation, &sighting.CreatedAt,
		&location.ID, &location.StreetAddress, &location.PostalCode, &location.Latitude, &location.Longitude, &location.CityID,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return generic.Response(http.StatusNotFound, generic.Json{"error": "sighting not found"})
		}
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": err.Error()})
	}

	sighting.DateFound = dateFound
	sighting.Location = &location
	return generic.Response(http.StatusOK, generic.Json{"data": sighting})
}

// ------------------ UPDATE ------------------
func handleUpdate(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, email, err := extractUserFromToken(request)
	if err != nil {
		return generic.Response(http.StatusUnauthorized, generic.Json{"error": err.Error()})
	}

	listingID := request.PathParameters["id"]
	if listingID == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{"error": "listing ID required"})
	}

	var req SightingRequest
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{"error": "invalid request body"})
	}

	ctx := context.Background()
	conn, err := generic.SupabaseConnect()
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to connect to database"})
	}
	defer conn.Close(ctx)

	userUUID, _ := getUserUUID(ctx, conn, email)

	// Ownership check
	var ownerID string
	err = conn.QueryRow(ctx, "SELECT listing_owner FROM sighting_listing WHERE id=$1", listingID).Scan(&ownerID)
	if err != nil || ownerID != userUUID {
		return generic.Response(http.StatusForbidden, generic.Json{"error": "no permission"})
	}

	updateFields := []string{}
	args := []interface{}{}
	argPos := 1

	if req.PetName != nil {
		updateFields = append(updateFields, "pet_name=$"+strconv.Itoa(argPos))
		args = append(args, req.PetName)
		argPos++
	}
	if req.PetID != nil {
		updateFields = append(updateFields, "pet_id=$"+strconv.Itoa(argPos))
		args = append(args, req.PetID)
		argPos++
	}
	if req.Gender != nil {
		updateFields = append(updateFields, "gender=$"+strconv.Itoa(argPos))
		args = append(args, req.Gender)
		argPos++
	}
	if len(req.Breed) > 0 {
		updateFields = append(updateFields, "breed=$"+strconv.Itoa(argPos))
		args = append(args, req.Breed)
		argPos++
	}
	if len(req.Color) > 0 {
		updateFields = append(updateFields, "color=$"+strconv.Itoa(argPos))
		args = append(args, req.Color)
		argPos++
	}
	if req.AnimalType != "" {
		updateFields = append(updateFields, "animal_type=$"+strconv.Itoa(argPos))
		args = append(args, req.AnimalType)
		argPos++
	}
	if req.Description != "" {
		updateFields = append(updateFields, "description=$"+strconv.Itoa(argPos))
		args = append(args, req.Description)
		argPos++
	}
	if req.DateSpotted != "" {
		dateSpotted, _ := parseDate(req.DateSpotted)
		updateFields = append(updateFields, "date_spotted=$"+strconv.Itoa(argPos))
		args = append(args, dateSpotted)
		argPos++
	}
	if req.IsFound != nil {
		updateFields = append(updateFields, "is_found=$"+strconv.Itoa(argPos))
		args = append(args, *req.IsFound)
		argPos++
		if *req.IsFound {
			updateFields = append(updateFields, "date_found=$"+strconv.Itoa(argPos))
			args = append(args, time.Now())
			argPos++
		}
	}

	// Location update
	if req.Location != "" && req.LocationCoords != nil {
		cityID, _ := getOrCreateCity(ctx, conn, req.City, req.ProvinceOrState, req.Country)
		locationID, _ := getOrCreateLocation(ctx, conn, req.Location, req.PostalCode, req.LocationCoords.Lat, req.LocationCoords.Lng, cityID)
		updateFields = append(updateFields, "spotted_location=$"+strconv.Itoa(argPos))
		args = append(args, locationID)
		argPos++
	}

	if len(updateFields) == 0 {
		return generic.Response(http.StatusBadRequest, generic.Json{"error": "no fields to update"})
	}

	args = append(args, listingID)
	query := "UPDATE sighting_listing SET " + strings.Join(updateFields, ", ") + " WHERE id=$" + strconv.Itoa(argPos)
	_, err = conn.Exec(ctx, query, args...)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to update sighting"})
	}

	return generic.Response(http.StatusOK, generic.Json{"message": "Sighting updated successfully"})
}

// ------------------ DELETE ------------------
func handleDelete(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	_, email, _ := extractUserFromToken(request)
	listingID := request.PathParameters["id"]
	if listingID == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{"error": "listing ID required"})
	}

	ctx := context.Background()
	conn, _ := generic.SupabaseConnect()
	defer conn.Close(ctx)

	userUUID, _ := GetUserUUID(ctx, conn, email)

	// Ownership check
	var ownerID string
	err := conn.QueryRow(ctx, "SELECT listing_owner FROM sighting_listing WHERE id=$1", listingID).Scan(&ownerID)
	if err != nil || ownerID != userUUID {
		return generic.Response(http.StatusForbidden, generic.Json{"error": "no permission"})
	}

	_, err = conn.Exec(ctx, "DELETE FROM sighting_listing WHERE id=$1", listingID)
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{"error": "failed to delete sighting"})
	}

	return generic.Response(http.StatusOK, generic.Json{"message": "Sighting deleted successfully"})
}
