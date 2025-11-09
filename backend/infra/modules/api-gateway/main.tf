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

module "sighting_listing_endpoint" {
  source = "./template-endpoint"

  path_part             = "sighting-listing"
  http_method           = "POST"
  model_name            = "sightingListingModel"
  description           = "Model for validating sightting listing parameters"
  schema                = <<EOF
  {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "minLength": 1,
        "description": "Name of pet"
      }
    }
  }
  EOF
  func_name             = var.sightings_listing_function_name
  invoke_arn            = var.sightings_listing_invoke_arn
  rest_api_id           = module.rest_api.rest_api_id
  execution_arn         = module.rest_api.execution_arn
  request_validator_id  = module.rest_api.body_validator_id
  root_resource_id      = module.rest_api.root_resource_id
}

module "lost_listing_endpoint" {
  source = "./template-endpoint"

  path_part             = "lost-listing"
  http_method           = "POST"
  model_name            = "lostListingModel"
  description           = "Model for validating lost pet listing parameters"
  schema                = <<EOF
  {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "minLength": 1,
        "description": "Name of pet"
      }
    },
    "required": ["name"]
  }
  EOF
  func_name             = var.lost_listing_function_name
  invoke_arn            = var.lost_listing_invoke_arn
  rest_api_id           = module.rest_api.rest_api_id
  execution_arn         = module.rest_api.execution_arn
  request_validator_id  = module.rest_api.body_validator_id
  root_resource_id      = module.rest_api.root_resource_id
}