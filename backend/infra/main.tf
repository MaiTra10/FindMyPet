# Create the Lambda functions
module "lambda-functions" {
    source = "./modules/lambda"
}
module "api-gateway" {
    source = "./modules/api-gateway"
    log_in_function_name = module.lambda-functions.log_in_function_name
    log_in_invoke_arn = module.lambda-functions.log_in_invoke_arn
}