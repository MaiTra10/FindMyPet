resource "random_id" "suffix" {
  byte_length = 4
}
# Create the Lambda functions
module "lambda-functions" {
  source = "./modules/lambda"
}
module "api-gateway" {
  source               = "./modules/api-gateway"
  log_in_function_name = module.lambda-functions.log_in_function_name
  log_in_invoke_arn    = module.lambda-functions.log_in_invoke_arn
}

module "image-bucket" {
  source      = "./modules/s3-bucket"
  bucket_name = "image-bucket-${var.aws_region}-${random_id.suffix.hex}"
}
