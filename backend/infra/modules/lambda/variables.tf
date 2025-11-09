variable "database_url" {
    type = string
    description = ""
}
variable "google_client_id" {
    type        = string
    description = "The web client ID for authenticating Google token"
}
variable "jwt_secret" {
    type        = string
    description = "JWT secret key"
}
variable "s3_bucket_name" {
    type        = string
    description = "S3 bucket name for image uploads"
}