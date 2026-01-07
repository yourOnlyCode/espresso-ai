# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Set up production database (PostgreSQL)
- [ ] Set up Redis instance
- [ ] Create S3 bucket for document storage
- [ ] Obtain SSL certificates
- [ ] Set up domain and DNS
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

---

## AWS Deployment

### 1. Database Setup (RDS PostgreSQL)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier docauto-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --multi-az
```

### 2. Redis Setup (ElastiCache)

```bash
# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id docauto-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### 3. S3 Bucket Setup

```bash
# Create S3 bucket
aws s3 mb s3://docauto-documents-prod

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket docauto-documents-prod \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket docauto-documents-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set CORS policy
aws s3api put-bucket-cors \
  --bucket docauto-documents-prod \
  --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 4. Backend Deployment (ECS Fargate)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and push to ECR:**
```bash
# Create ECR repository
aws ecr create-repository --repository-name docauto-backend

# Build Docker image
docker build -t docauto-backend .

# Tag and push
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag docauto-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/docauto-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/docauto-backend:latest
```

**ECS Task Definition (task-definition.json):**
```json
{
  "family": "docauto-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "docauto-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/docauto-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/docauto-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Create ECS Service:**
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name docauto-prod

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster docauto-prod \
  --service-name docauto-backend \
  --task-definition docauto-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=docauto-backend,containerPort=3000"
```

### 5. Frontend Deployment (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables in Vercel:**
- `API_URL`: https://api.yourdomain.com

### 6. Load Balancer Setup (ALB)

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name docauto-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name docauto-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx \
  --health-check-path /health

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=<cert-arn> \
  --default-actions Type=forward,TargetGroupArn=<tg-arn>
```

---

## Environment Variables (Production)

### Backend (.env)
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=docauto-prod.xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=docauto
DB_USER=admin
DB_PASSWORD=<from-secrets-manager>

# Redis
REDIS_HOST=docauto-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379

# JWT
JWT_SECRET=<from-secrets-manager>
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<iam-role-based>
AWS_SECRET_ACCESS_KEY=<iam-role-based>
S3_BUCKET_NAME=docauto-documents-prod

# OpenAI
OPENAI_API_KEY=<from-secrets-manager>

# Stripe
STRIPE_SECRET_KEY=<from-secrets-manager>
STRIPE_WEBHOOK_SECRET=<from-secrets-manager>

# Email
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<ses-credentials>
SMTP_PASSWORD=<ses-credentials>

# Frontend
FRONTEND_URL=https://app.yourdomain.com
```

---

## Database Migration

```bash
# SSH into ECS task or run as one-off task
aws ecs run-task \
  --cluster docauto-prod \
  --task-definition docauto-backend \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --overrides '{"containerOverrides":[{"name":"docauto-backend","command":["npm","run","migrate"]}]}'
```

---

## Monitoring & Logging

### CloudWatch Logs
```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/docauto-backend

# Set retention
aws logs put-retention-policy \
  --log-group-name /ecs/docauto-backend \
  --retention-in-days 30
```

### CloudWatch Alarms
```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name docauto-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name docauto-high-errors \
  --alarm-description "Alert on high error rate" \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## Backup Strategy

### Database Backups
- Automated daily snapshots (RDS)
- 7-day retention
- Cross-region replication for disaster recovery

### S3 Backups
- Versioning enabled
- Lifecycle policy for old versions
- Cross-region replication

```bash
# Enable cross-region replication
aws s3api put-bucket-replication \
  --bucket docauto-documents-prod \
  --replication-configuration file://replication.json
```

---

## Security Checklist

- [ ] Enable AWS WAF on ALB
- [ ] Configure security groups (least privilege)
- [ ] Enable VPC Flow Logs
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Enable CloudTrail for audit logging
- [ ] Configure IAM roles (no hardcoded credentials)
- [ ] Enable MFA for AWS console access
- [ ] Set up AWS GuardDuty
- [ ] Configure SSL/TLS certificates
- [ ] Enable database encryption at rest
- [ ] Enable S3 bucket encryption
- [ ] Set up DDoS protection (AWS Shield)

---

## Scaling Configuration

### Auto Scaling (ECS)
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/docauto-prod/docauto-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/docauto-prod/docauto-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: docauto-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster docauto-prod \
            --service docauto-backend \
            --force-new-deployment

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend
```

---

## Post-Deployment

1. **Run smoke tests**
2. **Verify health endpoints**
3. **Check CloudWatch metrics**
4. **Test critical user flows**
5. **Monitor error rates**
6. **Update documentation**
7. **Notify team**

---

## Rollback Procedure

```bash
# Rollback ECS service to previous task definition
aws ecs update-service \
  --cluster docauto-prod \
  --service docauto-backend \
  --task-definition docauto-backend:PREVIOUS_VERSION

# Rollback Vercel deployment
vercel rollback <deployment-url>
```

---

## Cost Optimization

- Use Reserved Instances for RDS
- Use Savings Plans for ECS Fargate
- Enable S3 Intelligent-Tiering
- Set up CloudWatch billing alarms
- Review and optimize resource usage monthly

**Estimated Monthly Cost (Mid-Market):**
- RDS (db.t3.medium): ~$100
- ElastiCache (cache.t3.micro): ~$15
- ECS Fargate (2 tasks): ~$50
- S3 Storage (100GB): ~$3
- ALB: ~$20
- Data Transfer: ~$50
- **Total: ~$240/month**
