# API Gateway Resource
resource "aws_api_gateway_rest_api" "htc-api" {

    name        = "htc-api"
    description = <<EOT
    API Gateway for HackTheChange2025 endpoints.
    EOT

    endpoint_configuration {
        types   = ["REGIONAL"]
    }

}
# API Gateway request validators
resource "aws_api_gateway_request_validator" "body_validator" {

    rest_api_id           = aws_api_gateway_rest_api.htc-api.id
    name                  = "validate-body"
    validate_request_body = true

}