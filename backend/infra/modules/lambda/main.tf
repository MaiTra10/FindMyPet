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
