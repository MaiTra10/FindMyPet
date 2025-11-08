terraform {
  backend "s3" {
    bucket         = "tfstate-us-west-2-7431460e"
    key            = "HackTheChange2025/infra/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "tflock"
    encrypt        = true
  }
}
