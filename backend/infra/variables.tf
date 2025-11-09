variable "aws_region" {
    type        = string
    description = "The AWS region to deploy resources to"
}
variable "database_url" {
    type        = string
    description = "The session pooler URL for the PostgreSQL database"
}
variable "google_client_id" {
    type        = string
    description = "The web client ID for authenticating Google token"
}
variable "jwt_secret" {
    type        = string
    description = "JWT secret key"
}