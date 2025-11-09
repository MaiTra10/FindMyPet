# log-in
output "google_log_in_function_name" {
    value = module.google-log-in-lambda.function_name
}
output "google_log_in_invoke_arn" {
    value = module.google-log-in-lambda.invoke_arn
}
# sightings-listing
output "sightings_listing_function_name" {
    value = module.sightings-listing-lambda.function_name
}
output "sightings_listing_invoke_arn" {
    value = module.sightings-listing-lambda.invoke_arn
}
# lost-listing
output "lost_listing_function_name" {
    value = module.lost-listing-lambda.function_name
}
output "lost_listing_invoke_arn" {
    value = module.lost-listing-lambda.invoke_arn
}
# image-upload
output "image_upload_function_name" {
    value = module.image-upload-lambda.function_name
}
output "image_upload_invoke_arn" {
    value = module.image-upload-lambda.invoke_arn
}
