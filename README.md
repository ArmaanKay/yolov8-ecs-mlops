# yolov8-ecs-mlops

MLOps project: YOLOv8 object detection app deployed on AWS ECS (Fargate) with IaC + CI/CD.

## Structure
- app/backend: Flask API serving YOLOv8
- app/frontend: UI for uploading images + viewing detections
- infra: Terraform for AWS resources
- .github/workflows: CI/CD pipelines
