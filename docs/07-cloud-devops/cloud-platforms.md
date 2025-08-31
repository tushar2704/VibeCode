# ☁️ Cloud Platform Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Scalable Cloud-Native Development*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for cloud development insights and best practices

---

## Overview

Cloud platform development enables building scalable, resilient applications that leverage cloud-native services. This guide covers **AWS, Azure, GCP**, **serverless architectures**, **microservices deployment**, and **Context Engineering** methodology for cloud-first development.

## ⚡ Serverless Development

### AWS Lambda with TypeScript

```typescript
// lambda-functions/user-api/handler.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

interface User {
  userId: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

// GET /users/{userId}
export const getUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { userId } = event.pathParameters || {}
    
    if (!userId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'userId is required' })
      }
    }

    const command = new GetCommand({
      TableName: process.env.USERS_TABLE!,
      Key: { userId }
    })

    const result = await docClient.send(command)

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Item)
    }
  } catch (error) {
    console.error('Error getting user:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

// POST /users
export const createUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}')
    const { email, name } = body

    if (!email || !name) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email and name are required' })
      }
    }

    const userId = generateUserId()
    const timestamp = new Date().toISOString()

    const user: User = {
      userId,
      email,
      name,
      createdAt: timestamp,
      updatedAt: timestamp
    }

    const command = new PutCommand({
      TableName: process.env.USERS_TABLE!,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    })

    await docClient.send(command)

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(user)
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

// GET /users
export const listUsers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { limit = '10', startKey } = event.queryStringParameters || {}

    const command = new QueryCommand({
      TableName: process.env.USERS_TABLE!,
      IndexName: 'CreatedAtIndex',
      KeyConditionExpression: 'entityType = :type',
      ExpressionAttributeValues: {
        ':type': 'user'
      },
      Limit: parseInt(limit),
      ExclusiveStartKey: startKey ? JSON.parse(decodeURIComponent(startKey)) : undefined,
      ScanIndexForward: false // Most recent first
    })

    const result = await docClient.send(command)

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        users: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null
      })
    }
  } catch (error) {
    console.error('Error listing users:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

### Serverless Framework Configuration

```yaml
# serverless.yml
service: user-management-api

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: ${opt:region, 'us-east-1'}
  stage: ${opt:stage, 'dev'}
  environment:
    USERS_TABLE: ${self:service}-${self:provider.stage}-users
    STAGE: ${self:provider.stage}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource:
            - Fn::GetAtt: [UsersTable, Arn]
            - Fn::Join:
              - '/'
              - - Fn::GetAtt: [UsersTable, Arn]
                - '*'

plugins:
  - serverless-esbuild
  - serverless-offline
  - serverless-dynamodb-local

custom:
  esbuild:
    bundle: true
    minify: false
    sourcemap: true
    exclude:
      - '@aws-sdk/*'
    target: node18
    platform: node

functions:
  getUser:
    handler: src/handlers/user.getUser
    events:
      - http:
          path: users/{userId}
          method: get
          cors: true

  createUser:
    handler: src/handlers/user.createUser
    events:
      - http:
          path: users
          method: post
          cors: true

  listUsers:
    handler: src/handlers/user.listUsers
    events:
      - http:
          path: users
          method: get
          cors: true

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.USERS_TABLE}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
          - AttributeName: entityType
            AttributeType: S
          - AttributeName: createdAt
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        GlobalSecondaryIndexes:
          - IndexName: CreatedAtIndex
            KeySchema:
              - AttributeName: entityType
                KeyType: HASH
              - AttributeName: createdAt
                KeyType: RANGE
            Projection:
              ProjectionType: ALL

    # API Gateway Authorizer
    ApiGatewayAuthorizer:
      Type: AWS::ApiGateway::Authorizer
      Properties:
        Name: CognitoUserPool
        Type: COGNITO_USER_POOLS
        IdentitySource: method.request.header.Authorization
        RestApiId:
          Ref: ApiGatewayRestApi
        ProviderARNs:
          - Fn::GetAtt: [UserPool, Arn]
```

## 🏗️ Azure Functions with C#

### Function Implementation

```csharp
// Functions/UserFunctions.cs
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;
using Azure.Data.Tables;

namespace UserManagement.Functions
{
    public class UserFunctions
    {
        private readonly ILogger _logger;
        private readonly TableServiceClient _tableServiceClient;

        public UserFunctions(ILoggerFactory loggerFactory, TableServiceClient tableServiceClient)
        {
            _logger = loggerFactory.CreateLogger<UserFunctions>();
            _tableServiceClient = tableServiceClient;
        }

        [Function("GetUser")]
        public async Task<HttpResponseData> GetUser(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = "users/{userId}")] HttpRequestData req,
            string userId)
        {
            try
            {
                _logger.LogInformation($"Getting user: {userId}");

                var tableClient = _tableServiceClient.GetTableClient("users");
                var user = await tableClient.GetEntityIfExistsAsync<UserEntity>("user", userId);

                if (!user.HasValue)
                {
                    var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                    await notFoundResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "User not found" }));
                    return notFoundResponse;
                }

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json");
                
                var userDto = new UserDto
                {
                    UserId = user.Value.RowKey,
                    Email = user.Value.Email,
                    Name = user.Value.Name,
                    CreatedAt = user.Value.CreatedAt,
                    UpdatedAt = user.Value.UpdatedAt
                };

                await response.WriteStringAsync(JsonSerializer.Serialize(userDto));
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "Internal server error" }));
                return errorResponse;
            }
        }

        [Function("CreateUser")]
        public async Task<HttpResponseData> CreateUser(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = "users")] HttpRequestData req)
        {
            try
            {
                var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                var createUserRequest = JsonSerializer.Deserialize<CreateUserRequest>(requestBody);

                if (string.IsNullOrEmpty(createUserRequest?.Email) || string.IsNullOrEmpty(createUserRequest?.Name))
                {
                    var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequestResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "Email and name are required" }));
                    return badRequestResponse;
                }

                var userId = $"user_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid().ToString()[..8]}";
                var timestamp = DateTimeOffset.UtcNow;

                var userEntity = new UserEntity
                {
                    PartitionKey = "user",
                    RowKey = userId,
                    Email = createUserRequest.Email,
                    Name = createUserRequest.Name,
                    CreatedAt = timestamp,
                    UpdatedAt = timestamp
                };

                var tableClient = _tableServiceClient.GetTableClient("users");
                await tableClient.AddEntityAsync(userEntity);

                var response = req.CreateResponse(HttpStatusCode.Created);
                response.Headers.Add("Content-Type", "application/json");
                
                var userDto = new UserDto
                {
                    UserId = userEntity.RowKey,
                    Email = userEntity.Email,
                    Name = userEntity.Name,
                    CreatedAt = userEntity.CreatedAt,
                    UpdatedAt = userEntity.UpdatedAt
                };

                await response.WriteStringAsync(JsonSerializer.Serialize(userDto));
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "Internal server error" }));
                return errorResponse;
            }
        }
    }

    public class UserEntity : ITableEntity
    {
        public string PartitionKey { get; set; } = default!;
        public string RowKey { get; set; } = default!;
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }
        
        public string Email { get; set; } = default!;
        public string Name { get; set; } = default!;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class UserDto
    {
        public string UserId { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Name { get; set; } = default!;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }

    public class CreateUserRequest
    {
        public string Email { get; set; } = default!;
        public string Name { get; set; } = default!;
    }
}
```

## 🌍 Google Cloud Platform

### Cloud Functions with Python

```python
# main.py
from google.cloud import firestore
from flask import Request, jsonify
import functions_framework
import json
from datetime import datetime, timezone
import uuid
import logging

# Initialize Firestore client
db = firestore.Client()

@functions_framework.http
def user_api(request: Request):
    """Cloud Function for user management API"""
    
    # Enable CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    try:
        path_parts = request.path.strip('/').split('/')
        
        if request.method == 'GET' and len(path_parts) == 2 and path_parts[0] == 'users':
            # GET /users/{user_id}
            user_id = path_parts[1]
            return get_user(user_id, headers)
            
        elif request.method == 'GET' and len(path_parts) == 1 and path_parts[0] == 'users':
            # GET /users
            return list_users(request, headers)
            
        elif request.method == 'POST' and len(path_parts) == 1 and path_parts[0] == 'users':
            # POST /users
            return create_user(request, headers)
            
        else:
            return jsonify({'error': 'Not found'}), 404, headers
            
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500, headers

def get_user(user_id: str, headers: dict):
    """Get a user by ID"""
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404, headers
            
        user_data = user_doc.to_dict()
        user_data['user_id'] = user_doc.id
        
        return jsonify(user_data), 200, headers
        
    except Exception as e:
        logging.error(f"Error getting user {user_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500, headers

def create_user(request: Request, headers: dict):
    """Create a new user"""
    try:
        request_json = request.get_json()
        
        if not request_json or not request_json.get('email') or not request_json.get('name'):
            return jsonify({'error': 'Email and name are required'}), 400, headers
        
        user_id = f"user_{int(datetime.now(timezone.utc).timestamp() * 1000)}_{str(uuid.uuid4())[:8]}"
        timestamp = datetime.now(timezone.utc).isoformat()
        
        user_data = {
            'email': request_json['email'],
            'name': request_json['name'],
            'created_at': timestamp,
            'updated_at': timestamp
        }
        
        # Add user to Firestore
        user_ref = db.collection('users').document(user_id)
        user_ref.set(user_data)
        
        # Return created user
        user_data['user_id'] = user_id
        return jsonify(user_data), 201, headers
        
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500, headers

def list_users(request: Request, headers: dict):
    """List users with pagination"""
    try:
        limit = int(request.args.get('limit', 10))
        start_after = request.args.get('start_after')
        
        query = db.collection('users').order_by('created_at', direction=firestore.Query.DESCENDING)
        
        if start_after:
            # Get the document to start after
            start_doc = db.collection('users').document(start_after).get()
            if start_doc.exists:
                query = query.start_after(start_doc)
        
        query = query.limit(limit)
        users = query.stream()
        
        user_list = []
        last_doc_id = None
        
        for user_doc in users:
            user_data = user_doc.to_dict()
            user_data['user_id'] = user_doc.id
            user_list.append(user_data)
            last_doc_id = user_doc.id
        
        response_data = {
            'users': user_list,
            'next_page_token': last_doc_id if len(user_list) == limit else None
        }
        
        return jsonify(response_data), 200, headers
        
    except Exception as e:
        logging.error(f"Error listing users: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500, headers
```

## 🚀 Deployment Strategies

### Multi-Environment Terraform

```hcl
# terraform/environments/prod/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "user-management/prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "../../modules/vpc"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

# Application Load Balancer
module "alb" {
  source = "../../modules/alb"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
}

# ECS Cluster
module "ecs" {
  source = "../../modules/ecs"
  
  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  private_subnets  = module.vpc.private_subnets
  alb_target_group_arn = module.alb.target_group_arn
  alb_security_group_id = module.alb.security_group_id
}

# RDS Database
module "rds" {
  source = "../../modules/rds"
  
  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  private_subnets     = module.vpc.private_subnets
  database_name       = var.database_name
  master_username     = var.database_username
  master_password     = var.database_password
  instance_class      = var.database_instance_class
  allocated_storage   = var.database_allocated_storage
}

# ElastiCache Redis
module "redis" {
  source = "../../modules/redis"
  
  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  private_subnets  = module.vpc.private_subnets
  node_type        = var.redis_node_type
  num_cache_nodes  = var.redis_num_nodes
}

# S3 Buckets
module "s3" {
  source = "../../modules/s3"
  
  project_name = var.project_name
  environment  = var.environment
}

# CloudFront Distribution
module "cloudfront" {
  source = "../../modules/cloudfront"
  
  project_name          = var.project_name
  environment           = var.environment
  alb_domain_name       = module.alb.dns_name
  s3_bucket_domain_name = module.s3.static_bucket_domain_name
}
```

### Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: user-management
  labels:
    name: user-management
---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: user-management
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  API_PORT: "3000"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: user-management
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
  REDIS_PASSWORD: <base64-encoded-redis-password>
---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-api
  namespace: user-management
  labels:
    app: user-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-api
  template:
    metadata:
      labels:
        app: user-api
    spec:
      containers:
      - name: user-api
        image: your-registry/user-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DB_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: user-api-service
  namespace: user-management
spec:
  selector:
    app: user-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: user-api-ingress
  namespace: user-management
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: user-api-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: user-api-service
            port:
              number: 80
---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-api-hpa
  namespace: user-management
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🔧 Context Engineering for Cloud Development

### System Context Template

```markdown
# Cloud Platform Development Context Template

## System Context Layer
- Senior Cloud Architect with multi-platform expertise
- DevOps and Infrastructure as Code specialist  
- Security and compliance focus
- Cost optimization and monitoring expert

## Domain Context Layer
- Cloud Platforms: AWS, Azure, GCP
- Containerization: Docker, Kubernetes
- Infrastructure: Terraform, CloudFormation, ARM Templates
- Monitoring: CloudWatch, Azure Monitor, Stackdriver
- Security: IAM, Key Management, Network Security

## Task Context Layer
- Scalability requirements (traffic, data, geographic)
- Security and compliance requirements (SOC2, GDPR, HIPAA)
- Performance requirements (latency, throughput)
- Cost optimization constraints
- High availability and disaster recovery needs
```

### Architecture Decision Template

```markdown
# Architecture Decision Record (ADR)

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
- Business requirements and constraints
- Technical constraints and considerations
- Stakeholder concerns

## Decision
- Chosen solution and rationale
- Alternative options considered
- Trade-offs and compromises

## Consequences
- Positive outcomes expected
- Negative consequences and risks
- Mitigation strategies
```

## 📚 Key Takeaways

1. **Cloud-Native First**: Design for cloud platforms from the beginning
2. **Serverless When Possible**: Leverage managed services for scalability and cost
3. **Infrastructure as Code**: Version control and automate infrastructure
4. **Multi-Cloud Strategy**: Avoid vendor lock-in with portable architectures
5. **Security by Design**: Implement security at every layer and service
6. **Cost Optimization**: Monitor and optimize costs continuously

---

**Next**: [Container Orchestration →](containers.md)