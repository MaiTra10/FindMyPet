# Step 1: Create the shared REST API
module "rest_api" {
  source = "./rest-api"
  # optional: override defaults if you want
  # rest_api_name        = "htc-api"
  # rest_api_description = "API Gateway for HackTheChange2025 endpoints"
  # endpoint_types       = ["REGIONAL"]
}

# Step 2: Create the /log-in endpoint
module "log_in_endpoint" {
  source = "./template-endpoint"

  path_part             = "log-in"
  http_method           = "POST"
  model_name            = "logInModel"
  description           = "Model for validating login requests"
  schema                = <<EOF
    {
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            "password": {
                "type": "string",
                "minLength": 8,
                "pattern": "(?=.*[a-z])(?=.*[A-Z])(?=.*[\\W_]).*"
            }
        },
        "required": ["email", "password"]
    }
    EOF
  func_name             = var.log_in_function_name
  invoke_arn            = var.log_in_invoke_arn
  rest_api_id           = module.rest_api.rest_api_id
  execution_arn         = module.rest_api.execution_arn
  request_validator_id  = module.rest_api.body_validator_id
  root_resource_id      = module.rest_api.root_resource_id
}
