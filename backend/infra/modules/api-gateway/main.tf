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
      "listing_owner": {
        "type": "string",
        "format": "uuid",
        "description": "UUID of the user who created the listing"
      },
      "is_found": {
        "type": "boolean",
        "description": "Indicates whether the pet has been found"
      },
      "date_found": {
        "type": ["string", "null"],
        "format": "date",
        "description": "Date the pet was found"
      },
      "pet_name": {
        "type": ["string", "null"],
        "maxLength": 100,
        "description": "Name of the pet if known"
      },
      "pet_id": {
        "type": ["string", "null"],
        "description": "Pet identifier, such as a tag or microchip"
      },
      "gender": {
        "type": ["string", "null"],
        "enum": ["male", "female", "unknown"],
        "description": "Gender of the pet"
      },
      "breed": {
        "type": ["array", "null"],
        "items": { "type": "string" },
        "description": "List of breeds associated with the pet"
      },
      "color": {
        "type": "array",
        "items": { "type": "string" },
        "minItems": 1,
        "description": "List of colors observed on the pet"
      },
      "animal_type": {
        "type": "string",
        "description": "Type of animal (e.g., dog, cat, bird)"
      },
      "description": {
        "type": ["string", "null"],
        "maxLength": 300,
        "description": "Description of the sighting"
      },
      "image_urls": {
        "type": "array",
        "items": { "type": "string", "format": "uri" },
        "minItems": 1,
        "description": "List of image URLs showing the pet"
      },
      "date_spotted": {
        "type": "string",
        "format": "date",
        "description": "Date the pet was spotted"
      },
      "spotted_location": {
        "type": "integer",
        "description": "Foreign key to a location record"
      }
    },
    "required": [
      "listing_owner",
      "color",
      "animal_type",
      "image_urls",
      "date_spotted",
      "spotted_location"
    ],
    "additionalProperties": false
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
        "maxLength": 100,
        "description": "Name of the lost pet"
      },
      "animalType": {
        "type": "string",
        "description": "Type of animal (e.g., dog, cat, bird)"
      },
      "gender": {
        "type": ["string", "null"],
        "enum": ["male", "female", "unknown"],
        "description": "Gender of the pet"
      },
      "breed": {
        "type": ["string", "null"],
        "maxLength": 100,
        "description": "Breed of the pet"
      },
      "color": {
        "type": "string",
        "minLength": 1,
        "description": "Color of the pet"
      },
      "age": {
        "type": ["string", "null"],
        "description": "Age of the pet"
      },
      "dateLost": {
        "type": "string",
        "format": "date-time",
        "description": "Date and time when the pet was lost (ISO 8601 format)"
      },
      "location": {
        "type": "string",
        "minLength": 1,
        "description": "Location where the pet was lost"
      },
      "locationCoords": {
        "type": ["object", "null"],
        "properties": {
          "lat": {
            "type": "number",
            "description": "Latitude coordinate"
          },
          "lng": {
            "type": "number",
            "description": "Longitude coordinate"
          }
        },
        "required": ["lat", "lng"],
        "additionalProperties": false
      },
      "description": {
        "type": "string",
        "maxLength": 1000,
        "description": "Description of the lost pet"
      },
      "contact": {
        "type": "string",
        "minLength": 1,
        "description": "Contact information for the pet owner"
      }
    },
    "required": [
      "name",
      "animalType",
      "color",
      "dateLost",
      "location",
      "description",
      "contact"
    ],
    "additionalProperties": false
  }
  EOF
  func_name             = var.lost_listing_function_name
  invoke_arn            = var.lost_listing_invoke_arn
  rest_api_id           = module.rest_api.rest_api_id
  execution_arn         = module.rest_api.execution_arn
  request_validator_id  = module.rest_api.body_validator_id
  root_resource_id      = module.rest_api.root_resource_id
}