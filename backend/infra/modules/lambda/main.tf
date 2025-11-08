module "log-in-lambda" {

    source = "./template"
    function_name = "log-in"
    actions = ["*"]
    resources = ["*"]
    zip_dir_slice = "log-in"

}
