resource "random_id" "suffix" {
  byte_length = 4
}
# Create the S3 bucket first (needed for Lambda)
module "image-bucket" {
  source      = "./modules/s3-bucket"
  bucket_name = "image-bucket-${var.aws_region}-${random_id.suffix.hex}"
}

# Create the Lambda functions
module "lambda-functions" {
    source = "./modules/lambda"
    database_url = var.database_url
    google_client_id = var.google_client_id
    jwt_secret = var.jwt_secret
    s3_bucket_name = module.image-bucket.bucket_name
}
module "api-gateway" {
  source               = "./modules/api-gateway"
  google_log_in_function_name = module.lambda-functions.google_log_in_function_name
  google_log_in_invoke_arn    = module.lambda-functions.google_log_in_invoke_arn
  sightings_listing_function_name = module.lambda-functions.sightings_listing_function_name
  sightings_listing_invoke_arn = module.lambda-functions.sightings_listing_invoke_arn
  lost_listing_function_name = module.lambda-functions.lost_listing_function_name
  lost_listing_invoke_arn = module.lambda-functions.lost_listing_invoke_arn
  image_upload_function_name = module.lambda-functions.image_upload_function_name
  image_upload_invoke_arn = module.lambda-functions.image_upload_invoke_arn
}
