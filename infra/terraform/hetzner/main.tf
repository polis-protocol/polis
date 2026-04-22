# Hetzner Cloud — Discourse Server
# Provisions a VPS for self-hosted Discourse forum backend

terraform {
  required_version = ">= 1.5"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

variable "hcloud_token" {
  description = "Hetzner Cloud API token"
  type        = string
  sensitive   = true
}

variable "server_name" {
  description = "Name for the Discourse server"
  type        = string
  default     = "polis-discourse"
}

variable "server_type" {
  description = "Hetzner server type (e.g. cx22, cx32)"
  type        = string
  default     = "cx22"
}

variable "location" {
  description = "Hetzner datacenter location"
  type        = string
  default     = "nbg1"
}

variable "ssh_key_ids" {
  description = "List of Hetzner SSH key IDs to attach"
  type        = list(number)
  default     = []
}

variable "discourse_hostname" {
  description = "Public hostname for the Discourse instance"
  type        = string
}

variable "discourse_admin_email" {
  description = "Admin email for Discourse setup"
  type        = string
}

provider "hcloud" {
  token = var.hcloud_token
}

resource "hcloud_server" "discourse" {
  name        = var.server_name
  image       = "ubuntu-24.04"
  server_type = var.server_type
  location    = var.location
  ssh_keys    = var.ssh_key_ids

  user_data = templatefile("${path.module}/cloud-init.yml.tpl", {
    discourse_hostname    = var.discourse_hostname
    discourse_admin_email = var.discourse_admin_email
  })

  labels = {
    project = "polis"
    service = "discourse"
  }
}

resource "hcloud_firewall" "discourse" {
  name = "${var.server_name}-fw"

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = ["0.0.0.0/0", "::/0"]
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}

resource "hcloud_firewall_attachment" "discourse" {
  firewall_id = hcloud_firewall.discourse.id
  server_ids  = [hcloud_server.discourse.id]
}

output "server_ip" {
  description = "Public IPv4 address of the Discourse server"
  value       = hcloud_server.discourse.ipv4_address
}

output "server_status" {
  description = "Server status"
  value       = hcloud_server.discourse.status
}
