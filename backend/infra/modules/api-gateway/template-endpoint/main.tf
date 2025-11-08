# API Gateway resource path
resource "aws_api_gateway_resource" "path" {
  rest_api_id = var.rest_api_id
  parent_id   = var.root_resource_id
  path_part   = var.path_part
}
# Model for validation
resource "aws_api_gateway_model" "model" {
  rest_api_id  = var.rest_api_id
  name         = var.model_name
  description  = var.description
  content_type = "application/json"
  schema       = var.schema
}
# Method definition
resource "aws_api_gateway_method" "method" {
  rest_api_id          = var.rest_api_id
  resource_id          = aws_api_gateway_resource.path.id
  http_method          = var.http_method
  authorization        = "NONE"
  request_validator_id = var.request_validator_id

  request_models = {
    "application/json" = aws_api_gateway_model.model.name
  }
}
# Lambda Integration
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.path.id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = var.http_method
  type                    = "AWS_PROXY"
  uri                     = var.invoke_arn
}
# Permission for API Gateway to invoke the Lambda
resource "aws_lambda_permission" "lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway-${var.path_part}"
  action        = "lambda:InvokeFunction"
  function_name = var.func_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.execution_arn}/*/${var.http_method}/${var.path_part}"
}
