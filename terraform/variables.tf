variable "github_repository_owner" {
  description = "kotturi-mahipal"
  type = string
}
variable "github_pat" {
  description = "A GitHub Personal Access Token with read:packages scope."
  type        = string
  sensitive   = true
}