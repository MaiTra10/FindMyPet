variable "function_name" {
    type = string
}
variable "actions" {
    type = list(string)
}
variable "resources" {
    type = list(string)
}
variable "zip_dir_slice" {
    type = string
}
variable "environment_variables" {
  type        = map(string)
  description = "Environment variables for the Lambda function"
  default     = {}
}