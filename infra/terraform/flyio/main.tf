# Fly.io — BFF Deployment
# Deploys the @polis/bff Fastify server to Fly.io

terraform {
  required_version = ">= 1.5"

  required_providers {
    fly = {
      source  = "fly-apps/fly"
      version = "~> 0.1"
    }
  }
}

variable "fly_api_token" {
  description = "Fly.io API token"
  type        = string
  sensitive   = true
}

variable "app_name" {
  description = "Fly.io app name"
  type        = string
  default     = "polis-bff"
}

variable "region" {
  description = "Primary Fly.io region"
  type        = string
  default     = "gru"
}

variable "vm_size" {
  description = "Fly.io VM size"
  type        = string
  default     = "shared-cpu-1x"
}

variable "vm_memory" {
  description = "VM memory in MB"
  type        = number
  default     = 256
}

provider "fly" {
  fly_api_token = var.fly_api_token
}

resource "fly_app" "bff" {
  name = var.app_name
  org  = "personal"
}

resource "fly_machine" "bff" {
  app    = fly_app.bff.name
  region = var.region
  name   = "${var.app_name}-machine"

  config = {
    image = "registry.fly.io/${var.app_name}:latest"

    services = [{
      ports = [
        {
          port     = 443
          handlers = ["tls", "http"]
        },
        {
          port     = 80
          handlers = ["http"]
        }
      ]
      protocol      = "tcp"
      internal_port = 4000

      checks = [{
        type     = "http"
        port     = 4000
        path     = "/health"
        interval = 10000
        timeout  = 5000
      }]
    }]

    guest = {
      cpu_kind  = "shared"
      cpus      = 1
      memory_mb = var.vm_memory
    }
  }
}

output "app_url" {
  description = "Public URL of the BFF"
  value       = "https://${var.app_name}.fly.dev"
}
