module "google-log-in-lambda" {

    source = "./template"
    function_name = "google-log-in"
    actions = ["*"]
    resources = ["*"]
    zip_dir_slice = "google/log-in"

    environment_variables = {
        DATABASE_URL            = var.database_url
        GOOGLE_CLIENT_ID        = var.google_client_id
        JWT_SECRET              = var.jwt_secret
    }

}

module "sightings-listing-lambda" {

    source = "./template"
    function_name = "sighting-listing"
    actions = ["*"]
    resources = ["*"]
    zip_dir_slice = "sighting-listing"

    environment_variables = {
        DATABASE_URL            = var.database_url
        JWT_SECRET              = var.jwt_secret
    }

}

module "lost-listing-lambda" {

    source = "./template"
    function_name = "lost-listing"
    actions = ["*"]
    resources = ["*"]
    zip_dir_slice = "lost-listing"

    environment_variables = {
        DATABASE_URL            = var.database_url
        JWT_SECRET              = var.jwt_secret
    }

}