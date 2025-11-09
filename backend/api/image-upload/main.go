package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/MaiTra10/HackTheChange2025/backend/api/generic"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type PresignedURLRequest struct {
	FileName    string `json:"fileName"`
	ContentType string `json:"contentType"`
}

type PresignedURLResponse struct {
	UploadURL string `json:"uploadUrl"`
	FileKey   string `json:"fileKey"`
	FileURL   string `json:"fileUrl"`
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

func extractUserFromToken(request events.APIGatewayProxyRequest) (string, error) {
	authHeader := request.Headers["Authorization"]
	if authHeader == "" {
		authHeader = request.Headers["authorization"]
	}
	if authHeader == "" {
		return "", &AuthError{Message: "missing authorization header"}
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	token = strings.TrimSpace(token)

	_, err := generic.TokenClaims(token)
	if err != nil {
		return "", &AuthError{Message: "invalid or expired token", Err: err}
	}

	return token, nil
}

func main() {
	lambda.Start(handler)
}

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	if request.HTTPMethod == "OPTIONS" {
		return generic.Response(http.StatusOK, generic.Json{})
	}

	if request.HTTPMethod != "POST" {
		return generic.Response(http.StatusMethodNotAllowed, generic.Json{
			"error": "method not allowed",
		})
	}

	// Authenticate user
	_, err := extractUserFromToken(request)
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

	var req PresignedURLRequest
	if err := json.Unmarshal([]byte(request.Body), &req); err != nil {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error":   "invalid request body",
			"message": err.Error(),
		})
	}

	// Validate file name and content type
	if req.FileName == "" {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "fileName is required",
		})
	}

	// Validate content type (only images)
	allowedTypes := []string{"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}
	contentType := req.ContentType
	if contentType == "" {
		contentType = "image/jpeg" // default
	}

	isAllowed := false
	for _, allowed := range allowedTypes {
		if contentType == allowed {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		return generic.Response(http.StatusBadRequest, generic.Json{
			"error": "invalid content type. Only image files are allowed",
		})
	}

	// Get S3 bucket name from environment
	bucketName := getEnv("image-bucket-us-west-2-385f4a09", "")
	if bucketName == "" {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error": "S3 bucket name not configured",
		})
	}

	// Generate unique file key
	fileExtension := getFileExtension(req.FileName)
	fileKey := fmt.Sprintf("uploads/%s/%s%s", time.Now().Format("2006/01/02"), uuid.New().String(), fileExtension)

	// Load AWS config
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to load AWS config",
			"message": err.Error(),
		})
	}

	// Create S3 client
	s3Client := s3.NewFromConfig(cfg)

	// Generate presigned URL
	presignClient := s3.NewPresignClient(s3Client)
	presignedRequest, err := presignClient.PresignPutObject(context.Background(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(fileKey),
		ContentType: aws.String(contentType),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = 15 * time.Minute // URL expires in 15 minutes
	})

	if err != nil {
		return generic.Response(http.StatusInternalServerError, generic.Json{
			"error":   "failed to generate presigned URL",
			"message": err.Error(),
		})
	}

	// Construct the public URL
	fileURL := fmt.Sprintf("https://%s.s3.amazonaws.com/%s", bucketName, fileKey)

	return generic.Response(http.StatusOK, generic.Json{
		"uploadUrl": presignedRequest.URL,
		"fileKey":   fileKey,
		"fileURL":   fileURL,
	})
}

func getFileExtension(fileName string) string {
	parts := strings.Split(fileName, ".")
	if len(parts) < 2 {
		return ".jpg"
	}
	ext := "." + strings.ToLower(parts[len(parts)-1])
	// Validate extension
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	for _, allowed := range allowedExts {
		if ext == allowed {
			return ext
		}
	}
	return ".jpg"
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
