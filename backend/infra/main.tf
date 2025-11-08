# Create the Lambda functions
module "lambda-functions" {
    source = "./modules/lambda"
    database_url = var.database_url
    google_client_id = var.google_client_id
    jwt_secret = var.jwt_secret
}
module "api-gateway" {
    source = "./modules/api-gateway"
    google_log_in_function_name = module.lambda-functions.google_log_in_function_name
    google_log_in_invoke_arn = module.lambda-functions.google_log_in_invoke_arn
}