resource "random_id" "suffix" {
  byte_length = 4
}
# Create the Lambda functions
module "lambda-functions" {
    source = "./modules/lambda"
    database_url = var.database_url
    google_client_id = var.google_client_id
    jwt_secret = var.jwt_secret
}
module "api-gateway" {
  source               = "./modules/api-gateway"
  google_log_in_function_name = module.lambda-functions.google_log_in_function_name
  google_log_in_invoke_arn    = module.lambda-functions.google_log_in_invoke_arn
  sightings_listing_function_name = module.lambda-functions.sightings_listing_function_name
  sightings_listing_invoke_arn = module.lambda-functions.sightings_listing_invoke_arn
  lost_listing_function_name = module.lambda-functions.lost_listing_function_name
  lost_listing_invoke_arn = module.lambda-functions.lost_listing_invoke_arn
}

module "image-bucket" {
  source      = "./modules/s3-bucket"
  bucket_name = "image-bucket-${var.aws_region}-${random_id.suffix.hex}"
}
