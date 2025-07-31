# ECS to manage to our backend and frontend services
resource "aws_ecs_cluster" "main" {
  name = "ats-app-cluster"
}

# ALB to direct incoming traffic
resource "aws_lb" "main" {
  name = "ats-app-lb"
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.lb.id]
  subnets = [for subnet in aws_subnet.public : subnet.id]
}

# Target group for ALB to send traffic
resource "aws_lb_target_group" "main" {
  name = "ats-app-tg"
  port = 80
  protocol = "HTTP"
  vpc_id = aws_vpc.main.id
}

# ALB listener to check traffic at port 80
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port = 80
  protocol = "HTTP"
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}

# SG to allow HTTP traffic to LB
resource "aws_security_group" "lb" {
  name = "ats-lb-sg"
  description = "Allow HTTP incoming traffic"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}