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

module "image-upload-lambda" {

    source = "./template"
    function_name = "image-upload"
    actions = ["s3:PutObject", "s3:GetObject", "s3:PutObjectAcl"]
    resources = ["arn:aws:s3:::${var.s3_bucket_name}/*"]
    zip_dir_slice = "image-upload"

    environment_variables = {
        S3_BUCKET_NAME          = var.s3_bucket_name
        JWT_SECRET              = var.jwt_secret
    }

}