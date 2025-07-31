terraform {
  backend "s3" {
    bucket         = "kotturi-mahipal-ats-scanner-tfstate"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "ats-terraform-state-lock"
  }
}