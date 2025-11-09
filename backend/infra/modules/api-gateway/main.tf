module "rest_api" {
  source = "./rest-api"
}

module "google_log_in_endpoint" {
  source = "./template-endpoint"

  path_part             = "google-log-in"
  http_method           = "POST"
  model_name            = "googleLogInModel"
  description           = "Model for validating google login requests"
  schema                = <<EOF
  {
    "type": "object",
    "properties": {
      "token": {
        "type": "string",
        "minLength": 10,
        "description": "Google ID token returned from Google OAuth client"
      }
    },
    "required": ["token"]
  }
  EOF
  func_name             = var.google_log_in_function_name
  invoke_arn            = var.google_log_in_invoke_arn
  rest_api_id           = module.rest_api.rest_api_id
  execution_arn         = module.rest_api.execution_arn
  request_validator_id  = module.rest_api.body_validator_id
  root_resource_id      = module.rest_api.root_resource_id
}
