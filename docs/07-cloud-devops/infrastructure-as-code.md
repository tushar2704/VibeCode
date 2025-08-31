# 🏗️ Infrastructure as Code

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Automated Infrastructure Management*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for IaC insights and best practices

---

## Overview

Infrastructure as Code (IaC) enables versioned, repeatable, and automated infrastructure management. This guide covers **Terraform**, **CloudFormation**, **Pulumi**, **best practices**, and **Context Engineering** methodology for scalable infrastructure automation.

## 🌍 Terraform Enterprise Setup

### Project Structure

```
terraform/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
├── modules/
│   ├── vpc/
│   ├── ecs/
│   ├── rds/
│   ├── redis/
│   └── monitoring/
├── global/
│   ├── iam/
│   ├── route53/
│   └── s3/
└── shared/
    ├── variables.tf
    ├── outputs.tf
    └── providers.tf
```

### Main Configuration

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "environments/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment   = var.environment
      Project      = var.project_name
      ManagedBy    = "terraform"
      Owner        = var.team_name
      CostCenter   = var.cost_center
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
  
  azs = slice(data.aws_availability_zones.available.names, 0, 3)
  
  vpc_cidr = var.vpc_cidr
  private_subnets = [
    cidrsubnet(local.vpc_cidr, 8, 1),
    cidrsubnet(local.vpc_cidr, 8, 2),
    cidrsubnet(local.vpc_cidr, 8, 3)
  ]
  public_subnets = [
    cidrsubnet(local.vpc_cidr, 8, 101),
    cidrsubnet(local.vpc_cidr, 8, 102),
    cidrsubnet(local.vpc_cidr, 8, 103)
  ]
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"
  
  name = "${var.project_name}-${var.environment}"
  cidr = local.vpc_cidr
  
  azs             = local.azs
  private_subnets = local.private_subnets
  public_subnets  = local.public_subnets
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true
  
  tags = local.common_tags
}

# Security Groups
module "security_groups" {
  source = "../../modules/security-groups"
  
  name_prefix = "${var.project_name}-${var.environment}"
  vpc_id      = module.vpc.vpc_id
  
  tags = local.common_tags
}

# Application Load Balancer
module "alb" {
  source = "../../modules/alb"
  
  name = "${var.project_name}-${var.environment}-alb"
  vpc_id = module.vpc.vpc_id
  subnets = module.vpc.public_subnets
  
  security_group_ids = [module.security_groups.alb_security_group_id]
  
  enable_deletion_protection = var.environment == "prod"
  
  certificate_arn = var.ssl_certificate_arn
  
  tags = local.common_tags
}

# ECS Cluster
module "ecs" {
  source = "../../modules/ecs"
  
  cluster_name = "${var.project_name}-${var.environment}"
  
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  
  target_group_arn = module.alb.target_group_arn
  security_group_ids = [module.security_groups.ecs_security_group_id]
  
  # Service configuration
  service_name = var.service_name
  image_uri    = var.container_image
  cpu          = var.task_cpu
  memory       = var.task_memory
  desired_count = var.service_desired_count
  
  # Auto scaling
  min_capacity = var.autoscaling_min_capacity
  max_capacity = var.autoscaling_max_capacity
  
  # Environment variables
  environment_variables = var.environment_variables
  secrets = var.secrets
  
  tags = local.common_tags
}

# RDS Database
module "rds" {
  source = "../../modules/rds"
  
  identifier = "${var.project_name}-${var.environment}-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_encrypted     = true
  
  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  
  vpc_security_group_ids = [module.security_groups.rds_security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group
  
  backup_retention_period = var.environment == "prod" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  deletion_protection = var.environment == "prod"
  skip_final_snapshot = var.environment != "prod"
  
  monitoring_interval = var.environment == "prod" ? 60 : 0
  
  tags = local.common_tags
}

# Redis Cache
module "redis" {
  source = "../../modules/redis"
  
  cluster_id = "${var.project_name}-${var.environment}-cache"
  
  node_type       = var.redis_node_type
  num_cache_nodes = var.redis_num_nodes
  
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name  = module.vpc.elasticache_subnet_group
  security_group_ids = [module.security_groups.redis_security_group_id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = local.common_tags
}

# S3 Buckets
module "s3" {
  source = "../../modules/s3"
  
  project_name = var.project_name
  environment  = var.environment
  
  # Static assets bucket
  enable_static_website = true
  enable_versioning    = var.environment == "prod"
  
  # File uploads bucket  
  enable_cors = true
  cors_allowed_origins = var.cors_allowed_origins
  
  tags = local.common_tags
}

# CloudFront Distribution
module "cloudfront" {
  source = "../../modules/cloudfront"
  
  project_name = var.project_name
  environment  = var.environment
  
  # Origins
  alb_domain_name = module.alb.dns_name
  s3_bucket_domain_name = module.s3.static_bucket_domain_name
  
  # SSL Certificate
  certificate_arn = var.cloudfront_certificate_arn
  
  # Aliases
  aliases = var.domain_aliases
  
  tags = local.common_tags
}

# Monitoring
module "monitoring" {
  source = "../../modules/monitoring"
  
  project_name = var.project_name
  environment  = var.environment
  
  # Resources to monitor
  alb_arn = module.alb.arn
  ecs_cluster_name = module.ecs.cluster_name
  ecs_service_name = module.ecs.service_name
  rds_instance_id  = module.rds.instance_id
  
  # Notification settings
  sns_topic_arn = var.alerts_sns_topic_arn
  
  tags = local.common_tags
}
```

### VPC Module

```hcl
# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.cidr
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = merge(var.tags, {
    Name = var.name
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.name}-igw"
  })
}

resource "aws_subnet" "public" {
  count = length(var.public_subnets)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.name}-public-${var.azs[count.index]}"
    Type = "public"
  })
}

resource "aws_subnet" "private" {
  count = length(var.private_subnets)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.name}-private-${var.azs[count.index]}"
    Type = "private"
  })
}

resource "aws_eip" "nat" {
  count = var.enable_nat_gateway ? length(var.public_subnets) : 0

  domain = "vpc"
  depends_on = [aws_internet_gateway.main]

  tags = merge(var.tags, {
    Name = "${var.name}-nat-eip-${count.index + 1}"
  })
}

resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? length(var.public_subnets) : 0

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(var.tags, {
    Name = "${var.name}-nat-${count.index + 1}"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.name}-public-rt"
  })
}

resource "aws_route_table" "private" {
  count = length(var.private_subnets)

  vpc_id = aws_vpc.main.id

  dynamic "route" {
    for_each = var.enable_nat_gateway ? [1] : []
    content {
      cidr_block = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.main[count.index].id
    }
  }

  tags = merge(var.tags, {
    Name = "${var.name}-private-rt-${count.index + 1}"
  })
}

resource "aws_route_table_association" "public" {
  count = length(var.public_subnets)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count = length(var.private_subnets)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Database subnet group
resource "aws_db_subnet_group" "database" {
  name       = "${var.name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(var.tags, {
    Name = "${var.name}-db-subnet-group"
  })
}

# ElastiCache subnet group
resource "aws_elasticache_subnet_group" "cache" {
  name       = "${var.name}-cache-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}
```

### ECS Module with Auto Scaling

```hcl
# modules/ecs/main.tf
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = var.service_name
  network_mode             = "awsvpc"
  requires_compatibility   = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = var.service_name
      image = var.image_uri

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        for key, value in var.environment_variables : {
          name  = key
          value = tostring(value)
        }
      ]

      secrets = [
        for secret in var.secrets : {
          name      = secret.name
          valueFrom = secret.valueFrom
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command = [
          "CMD-SHELL",
          "curl -f http://localhost:${var.container_port}/health || exit 1"
        ]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }

      essential = true
    }
  ])

  tags = var.tags
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = var.service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  network_configuration {
    subnets          = var.private_subnets
    security_groups  = var.security_group_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = var.service_name
    container_port   = var.container_port
  }

  depends_on = [aws_iam_role.ecs_execution_role]

  tags = var.tags
}

# Auto Scaling
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "scale_up" {
  name               = "${var.service_name}-scale-up"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.service_name}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# IAM Roles
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.service_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.service_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Custom task role policies can be attached here
resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "${var.service_name}-ecs-task-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.project_name}-${var.environment}-*/*"
        ]
      }
    ]
  })
}
```

## 🔧 Context Engineering for IaC

### System Context Template

```markdown
# Infrastructure as Code Context Template

## System Context Layer
- Senior Infrastructure Engineer with multi-cloud expertise
- Automation and scalability specialist
- Security and compliance focus
- Cost optimization and resource management expert

## Domain Context Layer
- IaC Tools: Terraform, CloudFormation, Pulumi, CDK
- Cloud Providers: AWS, Azure, GCP
- Version Control: Git workflows, branching strategies
- CI/CD Integration: Automated testing and deployment
- Security: Policy as Code, compliance scanning

## Task Context Layer
- Infrastructure requirements (compute, storage, network)
- Scalability and performance requirements
- Security and compliance requirements (SOC2, PCI DSS)
- Cost constraints and optimization goals
- Disaster recovery and backup requirements
```

### Terraform Testing Strategy

```hcl
# test/terraform_test.go
package test

import (
    "testing"

    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestTerraformVPCModule(t *testing.T) {
    terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "name": "test-vpc",
            "cidr": "10.0.0.0/16",
            "azs": []string{"us-east-1a", "us-east-1b"},
            "private_subnets": []string{"10.0.1.0/24", "10.0.2.0/24"},
            "public_subnets": []string{"10.0.101.0/24", "10.0.102.0/24"},
            "enable_nat_gateway": true,
            "tags": map[string]string{
                "Environment": "test",
            },
        },
    })

    defer terraform.Destroy(t, terraformOptions)

    terraform.InitAndApply(t, terraformOptions)

    vpcId := terraform.Output(t, terraformOptions, "vpc_id")
    assert.NotEmpty(t, vpcId)

    privateSubnets := terraform.OutputList(t, terraformOptions, "private_subnets")
    assert.Len(t, privateSubnets, 2)

    publicSubnets := terraform.OutputList(t, terraformOptions, "public_subnets")
    assert.Len(t, publicSubnets, 2)
}
```

## 📚 Key Takeaways

1. **Modular Design**: Create reusable, composable infrastructure modules
2. **State Management**: Secure, centralized state storage with locking
3. **Testing Strategy**: Automated testing for infrastructure changes
4. **Security First**: Implement security policies and compliance scanning
5. **Cost Optimization**: Monitor and optimize infrastructure costs
6. **Documentation**: Comprehensive documentation for all infrastructure

---

**Next**: [Cross-Cutting Excellence →](../08-specialized/README.md)