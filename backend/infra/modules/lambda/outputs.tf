# log-in
output "google_log_in_function_name" {
    value = module.google-log-in-lambda.function_name
}
output "google_log_in_invoke_arn" {
    value = module.google-log-in-lambda.invoke_arn
}
