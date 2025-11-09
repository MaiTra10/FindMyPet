variable "google_log_in_function_name" {
    type        = string
    description = "The function name of the Lambda function for google-log-in"
}
variable "google_log_in_invoke_arn" {
    type        = string
    description = "The invoke ARN of the Lambda function for google-log-in"
}
variable "sightings_listing_function_name" {
    type        = string
    description = "The function name of the Lambda function for sightings-listing"
}
variable "sightings_listing_invoke_arn" {
    type        = string
    description = "The invoke ARN of the Lambda function for sightings-listing"
}
variable "lost_listing_function_name" {
    type        = string
    description = "The function name of the Lambda function for lost-listing"
}
variable "lost_listing_invoke_arn" {
    type        = string
    description = "The invoke ARN of the Lambda function for lost-listing"
}
variable "image_upload_function_name" {
    type        = string
    description = "The function name of the Lambda function for image-upload"
}
variable "image_upload_invoke_arn" {
    type        = string
    description = "The invoke ARN of the Lambda function for image-upload"
}