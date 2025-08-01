# ECS to manage to our backend and frontend services
resource "aws_ecs_cluster" "main" {
  name = "ats-app-cluster"
}

# --- Load Balancer Resources ---

resource "aws_lb" "main" {
  name               = "ats-app-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = [for subnet in aws_subnet.public : subnet.id]
}

# Target group for the FRONTEND service
resource "aws_lb_target_group" "frontend" {
  name         = "ats-frontend-tg"
  port         = 80
  protocol     = "HTTP"
  vpc_id       = aws_vpc.main.id
  target_type  = "ip"
  health_check {
    path = "/"
  }
}

# Target group for the BACKEND service
resource "aws_lb_target_group" "backend" {
  name         = "ats-backend-tg"
  port         = 8080
  protocol     = "HTTP"
  vpc_id       = aws_vpc.main.id
  target_type  = "ip"
  health_check {
    path = "/api/health" # Assuming a future health check endpoint
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  # Default action is to forward to the frontend
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# A listener rule to route /api/* traffic to the backend
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# Security group for the load balancer
resource "aws_security_group" "lb" {
  name        = "ats-lb-sg"
  description = "Allow HTTP inbound traffic to LB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- ECS Task Definitions and Services ---

# A security group for our ECS tasks to allow traffic from the load balancer
resource "aws_security_group" "ecs_tasks" {
  name        = "ats-ecs-tasks-sg"
  description = "Allow inbound traffic from the LB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.lb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# IAM Role that our ECS tasks will assume
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs_task_execution_role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Attach the required AWS managed policy to the role
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# --- SRE BEST PRACTICE: Private Registry Authentication ---
# Create a secret in AWS Secrets Manager to hold the GitHub PAT
resource "aws_secretsmanager_secret" "ghcr_pat" {
  name = "ghcr-pat"
}

resource "aws_secretsmanager_secret_version" "ghcr_pat_version" {
  secret_id     = aws_secretsmanager_secret.ghcr_pat.id
  secret_string = jsonencode({
    username = var.github_username
    password = var.github_pat
  })
}

# Add a policy to the ECS Task Execution Role to allow it to read the secret
resource "aws_iam_role_policy" "ecs_secrets_policy" {
  name = "ecs-secrets-policy"
  role = aws_iam_role.ecs_task_execution_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["secretsmanager:GetSecretValue"],
        Resource = [aws_secretsmanager_secret.ghcr_pat.arn]
      }
    ]
  })
}

# --- SRE BEST PRACTICE: Explicit Log Group Creation ---
resource "aws_cloudwatch_log_group" "backend_logs" {
  name = "/ecs/ats-backend"
}

resource "aws_cloudwatch_log_group" "frontend_logs" {
  name = "/ecs/ats-frontend"
}

# Backend Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "ats-backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions = jsonencode([
    {
      name      = "ats-backend-container"
      image     = "ghcr.io/${var.github_repository_owner}/ats-backend:latest"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
        }
      ]
      repositoryCredentials = {
        credentialsParameter = aws_secretsmanager_secret.ghcr_pat.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend_logs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  # This is the key fix: ensure the log group exists before creating the task definition
  depends_on = [aws_cloudwatch_log_group.backend_logs]
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "ats-frontend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions = jsonencode([
    {
      name      = "ats-frontend-container"
      image     = "ghcr.io/${var.github_repository_owner}/ats-frontend:latest"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
        }
      ]
      repositoryCredentials = {
        credentialsParameter = aws_secretsmanager_secret.ghcr_pat.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend_logs.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  # This is the key fix: ensure the log group exists before creating the task definition
  depends_on = [aws_cloudwatch_log_group.frontend_logs]
}

# Backend Service
resource "aws_ecs_service" "backend" {
  name            = "ats-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [for subnet in aws_subnet.public : subnet.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "ats-backend-container"
    container_port   = 8080
  }
}

# Frontend Service
resource "aws_ecs_service" "frontend" {
  name            = "ats-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [for subnet in aws_subnet.public : subnet.id]
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "ats-frontend-container"
    container_port   = 80
  }
}

# --- Monitoring and Alerting ---

resource "aws_cloudwatch_metric_alarm" "backend_cpu_high" {
  alarm_name          = "ats-backend-cpu-utilization-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors backend cpu utilization"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.backend.name
  }

  # In a real scenario, you would add an action to notify an SNS topic.
  # alarm_actions = [aws_sns_topic.user_updates.arn]
}