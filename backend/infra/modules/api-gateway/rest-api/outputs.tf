output "rest_api_id" {
  description = "The ID of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.htc-api.id
}
output "root_resource_id" {
  description = "The root resource ID of the REST API"
  value       = aws_api_gateway_rest_api.htc-api.root_resource_id
}
output "execution_arn" {
  description = "The execution ARN of the API Gateway REST API, used in Lambda permissions"
  value       = aws_api_gateway_rest_api.htc-api.execution_arn
}
output "body_validator_id" {
  description = "The ID of the API Gateway request validator for validating request bodies"
  value       = aws_api_gateway_request_validator.body_validator.id
}
