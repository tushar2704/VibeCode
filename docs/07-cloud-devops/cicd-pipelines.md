# 🚀 CI/CD Pipelines & Automation

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Automated Development Workflows*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for DevOps automation insights and best practices

---

## Overview

CI/CD pipelines automate software delivery from code to production. This guide covers **GitHub Actions**, **GitLab CI**, **Azure DevOps**, **deployment strategies**, and **Context Engineering** methodology for reliable, automated software delivery.

## 🔄 GitHub Actions Workflows

### Complete CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]

env:
  NODE_VERSION: '18.x'
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: |
        npm ci
        npm run build

    - name: Run linting
      run: |
        npm run lint
        npm run type-check

    - name: Run unit tests
      run: npm run test:unit
      env:
        NODE_ENV: test

    - name: Run integration tests
      run: npm run test:integration
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://postgres:password@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Run E2E tests
      run: |
        npm run test:e2e
        npm run test:e2e:mobile
      env:
        NODE_ENV: test

    - name: Generate coverage report
      run: npm run coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: test

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run npm audit
      run: npm audit --audit-level high

    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

    - name: Run SAST with CodeQL
      uses: github/codeql-action/analyze@v2
      with:
        languages: javascript

  build:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.event_name != 'pull_request'

    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.DOCKER_REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          NODE_VERSION=${{ env.NODE_VERSION }}
          BUILD_DATE=${{ github.event.head_commit.timestamp }}
          VCS_REF=${{ github.sha }}

    - name: Sign container image
      uses: sigstore/cosign-installer@v3

    - name: Sign the container image
      run: |
        cosign sign --yes ${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}
      env:
        COSIGN_EXPERIMENTAL: 1

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'

    - name: Set up Helm
      uses: azure/setup-helm@v3
      with:
        version: '3.10.0'

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name staging-cluster --region us-east-1

    - name: Deploy with Helm
      run: |
        helm upgrade --install myapp ./helm/myapp \
          --namespace myapp-staging \
          --create-namespace \
          --set image.repository=${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }} \
          --set image.tag=${{ github.sha }} \
          --set environment=staging \
          --wait --timeout=10m

    - name: Run smoke tests
      run: |
        kubectl wait --for=condition=ready pod -l app=myapp -n myapp-staging --timeout=300s
        npm run test:smoke -- --base-url=https://staging.myapp.com

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'release'
    environment: production

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup kubectl
      uses: azure/setup-kubectl@v3

    - name: Set up Helm
      uses: azure/setup-helm@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Update kubeconfig
      run: |
        aws eks update-kubeconfig --name production-cluster --region us-east-1

    - name: Blue/Green Deployment
      run: |
        # Deploy to green environment
        helm upgrade --install myapp-green ./helm/myapp \
          --namespace myapp-production \
          --set image.repository=${{ env.DOCKER_REGISTRY }}/${{ env.IMAGE_NAME }} \
          --set image.tag=${{ github.sha }} \
          --set environment=production \
          --set color=green \
          --wait --timeout=15m

        # Run production smoke tests
        npm run test:smoke -- --base-url=https://green.myapp.com

        # Switch traffic to green
        kubectl patch service myapp-service -n myapp-production \
          -p '{"spec":{"selector":{"color":"green"}}}'

        # Wait and cleanup blue
        sleep 300
        helm uninstall myapp-blue -n myapp-production || true

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### Reusable Workflows

```yaml
# .github/workflows/reusable-test.yml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      environment:
        required: false
        type: string
        default: 'test'
    secrets:
      DATABASE_URL:
        required: true
      REDIS_URL:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: |
        npm run test:unit
        npm run test:integration
      env:
        NODE_ENV: ${{ inputs.environment }}
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        REDIS_URL: ${{ secrets.REDIS_URL }}
```

## 🦊 GitLab CI/CD Pipeline

### Complete Pipeline Configuration

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - test
  - security
  - build
  - deploy-staging
  - deploy-production

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  NODE_VERSION: "18"
  POSTGRES_DB: test_db
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: password

# Templates
.node_template: &node_template
  image: node:18-alpine
  cache:
    key: "$CI_COMMIT_REF_SLUG"
    paths:
      - node_modules/
      - .npm/
  before_script:
    - npm ci --cache .npm --prefer-offline

.docker_template: &docker_template
  image: docker:24-dind
  services:
    - docker:24-dind
  before_script:
    - echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY

# Validation Stage
lint:
  <<: *node_template
  stage: validate
  script:
    - npm run lint
    - npm run type-check
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

audit:
  <<: *node_template
  stage: validate
  script:
    - npm audit --audit-level high
  allow_failure: true

# Test Stage
unit-tests:
  <<: *node_template
  stage: test
  script:
    - npm run test:unit
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - coverage/
    expire_in: 1 week

integration-tests:
  <<: *node_template
  stage: test
  services:
    - postgres:15-alpine
    - redis:7-alpine
  variables:
    DATABASE_URL: "postgresql://postgres:password@postgres:5432/test_db"
    REDIS_URL: "redis://redis:6379"
  script:
    - npm run test:integration
  artifacts:
    reports:
      junit: junit-integration.xml

e2e-tests:
  <<: *node_template
  stage: test
  services:
    - postgres:15-alpine
    - redis:7-alpine
  variables:
    DATABASE_URL: "postgresql://postgres:password@postgres:5432/test_db"
    REDIS_URL: "redis://redis:6379"
  script:
    - npm run build
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - cypress/screenshots/
      - cypress/videos/
    expire_in: 1 week

# Security Stage
sast:
  stage: security
  include:
    - template: Security/SAST.gitlab-ci.yml

dependency_scanning:
  stage: security
  include:
    - template: Security/Dependency-Scanning.gitlab-ci.yml

container_scanning:
  stage: security
  include:
    - template: Security/Container-Scanning.gitlab-ci.yml
  dependencies:
    - build

# Build Stage
build:
  <<: *docker_template
  stage: build
  script:
    - |
      if [[ "$CI_COMMIT_BRANCH" == "$CI_DEFAULT_BRANCH" ]]; then
        tag=""
        echo "Running on default branch '$CI_DEFAULT_BRANCH': tag = 'latest'"
      else
        tag=":$CI_COMMIT_REF_SLUG"
        echo "Running on branch '$CI_COMMIT_BRANCH': tag = $tag"
      fi
    - docker build --pull -t "$CI_REGISTRY_IMAGE${tag}" .
    - docker push "$CI_REGISTRY_IMAGE${tag}"
  rules:
    - if: $CI_COMMIT_BRANCH
      exists:
        - Dockerfile

# Deploy Staging
deploy-staging:
  image: alpine/helm:3.10.0
  stage: deploy-staging
  environment:
    name: staging
    url: https://staging.myapp.com
  before_script:
    - apk add --no-cache curl
    - curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/api/v1/releases/latest)/bin/linux/amd64/kubectl"
    - chmod +x kubectl && mv kubectl /usr/local/bin/
    - echo $KUBE_CONFIG_STAGING | base64 -d > ~/.kube/config
  script:
    - |
      helm upgrade --install myapp ./helm/myapp \
        --namespace myapp-staging \
        --create-namespace \
        --set image.repository=$CI_REGISTRY_IMAGE \
        --set image.tag=$CI_COMMIT_SHA \
        --set environment=staging \
        --wait --timeout=10m
    - kubectl get pods -n myapp-staging
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

# Deploy Production
deploy-production:
  image: alpine/helm:3.10.0
  stage: deploy-production
  environment:
    name: production
    url: https://myapp.com
  before_script:
    - apk add --no-cache curl
    - curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/api/v1/releases/latest)/bin/linux/amd64/kubectl"
    - chmod +x kubectl && mv kubectl /usr/local/bin/
    - echo $KUBE_CONFIG_PRODUCTION | base64 -d > ~/.kube/config
  script:
    - |
      # Blue/Green Deployment
      helm upgrade --install myapp-green ./helm/myapp \
        --namespace myapp-production \
        --set image.repository=$CI_REGISTRY_IMAGE \
        --set image.tag=$CI_COMMIT_SHA \
        --set environment=production \
        --set color=green \
        --wait --timeout=15m
      
      # Health check
      kubectl wait --for=condition=ready pod -l app=myapp,color=green -n myapp-production --timeout=300s
      
      # Switch traffic
      kubectl patch service myapp-service -n myapp-production \
        -p '{"spec":{"selector":{"color":"green"}}}'
      
      # Cleanup old blue deployment
      sleep 300
      helm uninstall myapp-blue -n myapp-production || true
  rules:
    - if: $CI_COMMIT_TAG
  when: manual
```

## 🔵 Azure DevOps Pipeline

### Multi-Stage Pipeline

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
    - main
    - develop
  tags:
    include:
    - v*

pr:
  branches:
    include:
    - main

variables:
  nodeVersion: '18.x'
  dockerRegistryServiceConnection: 'myapp-acr'
  imageRepository: 'myapp'
  containerRegistry: 'myregistry.azurecr.io'
  dockerfilePath: '$(Build.SourcesDirectory)/Dockerfile'
  tag: '$(Build.BuildId)'

stages:
- stage: Validate
  displayName: 'Validate and Test'
  jobs:
  - job: Test
    displayName: 'Run Tests'
    pool:
      vmImage: 'ubuntu-latest'
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        ports:
          5432:5432
      redis:
        image: redis:7-alpine
        ports:
          6379:6379

    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
      displayName: 'Install Node.js'

    - task: Cache@2
      inputs:
        key: 'npm | "$(Agent.OS)" | package-lock.json'
        restoreKeys: |
          npm | "$(Agent.OS)"
        path: $(npm_config_cache)
      displayName: 'Cache npm'

    - script: |
        npm ci
        npm run build
      displayName: 'Install dependencies and build'

    - script: |
        npm run lint
        npm run type-check
      displayName: 'Run linting and type checking'

    - script: npm run test:unit
      displayName: 'Run unit tests'
      env:
        NODE_ENV: test

    - script: npm run test:integration
      displayName: 'Run integration tests'
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://postgres:password@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - task: PublishTestResults@2
      condition: succeededOrFailed()
      inputs:
        testRunner: JUnit
        testResultsFiles: 'junit.xml'

    - task: PublishCodeCoverageResults@1
      inputs:
        codeCoverageTool: Cobertura
        summaryFileLocation: '$(System.DefaultWorkingDirectory)/coverage/cobertura-coverage.xml'

- stage: Security
  displayName: 'Security Scanning'
  dependsOn: Validate
  jobs:
  - job: SecurityScan
    displayName: 'Security Scan'
    pool:
      vmImage: 'ubuntu-latest'
    
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)

    - script: npm ci
      displayName: 'Install dependencies'

    - task: Npm@1
      inputs:
        command: 'custom'
        customCommand: 'audit --audit-level high'
      displayName: 'Run npm audit'
      continueOnError: true

    - task: WhiteSource@21
      inputs:
        cwd: '$(System.DefaultWorkingDirectory)'
      displayName: 'WhiteSource Scan'

- stage: Build
  displayName: 'Build and Push'
  dependsOn: [Validate, Security]
  condition: and(succeeded(), ne(variables['Build.Reason'], 'PullRequest'))
  jobs:
  - job: Build
    displayName: 'Build Docker Image'
    pool:
      vmImage: 'ubuntu-latest'
    
    steps:
    - task: Docker@2
      displayName: 'Build and push image'
      inputs:
        command: buildAndPush
        repository: $(imageRepository)
        dockerfile: $(dockerfilePath)
        containerRegistry: $(dockerRegistryServiceConnection)
        tags: |
          $(tag)
          latest

- stage: DeployStaging
  displayName: 'Deploy to Staging'
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
  jobs:
  - deployment: DeployStaging
    displayName: 'Deploy to Staging'
    pool:
      vmImage: 'ubuntu-latest'
    environment: 'staging'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: HelmDeploy@0
            inputs:
              connectionType: 'Kubernetes Service Connection'
              kubernetesServiceConnection: 'staging-k8s'
              namespace: 'myapp-staging'
              command: 'upgrade'
              chartType: 'FilePath'
              chartPath: '$(Pipeline.Workspace)/helm/myapp'
              releaseName: 'myapp'
              arguments: |
                --create-namespace
                --set image.repository=$(containerRegistry)/$(imageRepository)
                --set image.tag=$(tag)
                --set environment=staging
                --wait --timeout=10m

- stage: DeployProduction
  displayName: 'Deploy to Production'
  dependsOn: Build
  condition: and(succeeded(), startsWith(variables['Build.SourceBranch'], 'refs/tags/v'))
  jobs:
  - deployment: DeployProduction
    displayName: 'Deploy to Production'
    pool:
      vmImage: 'ubuntu-latest'
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: HelmDeploy@0
            inputs:
              connectionType: 'Kubernetes Service Connection'
              kubernetesServiceConnection: 'production-k8s'
              namespace: 'myapp-production'
              command: 'upgrade'
              chartType: 'FilePath'
              chartPath: '$(Pipeline.Workspace)/helm/myapp'
              releaseName: 'myapp'
              arguments: |
                --set image.repository=$(containerRegistry)/$(imageRepository)
                --set image.tag=$(tag)
                --set environment=production
                --wait --timeout=15m
```

## 🔧 Advanced Deployment Strategies

### Canary Deployment with Flagger

```yaml
# k8s/canary.yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: myapp-canary
  namespace: myapp-production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  progressDeadlineSeconds: 60
  service:
    port: 80
    targetPort: 3000
    gateways:
    - myapp-gateway
    hosts:
    - myapp.com
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 1m
    - name: request-duration
      thresholdRange:
        max: 500
      interval: 30s
    - name: cpu-usage
      thresholdRange:
        max: 80
      interval: 30s
    webhooks:
    - name: load-test
      type: rollout
      url: http://flagger-loadtester.test/
      timeout: 5s
      metadata:
        type: bash
        cmd: "hey -z 1m -q 10 -c 2 http://myapp-canary.myapp-production:80/"
    - name: slack-notification
      type: event
      url: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
      metadata:
        channel: "#deployments"
```

### ArgoCD Application

```yaml
# argocd/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/myapp-k8s
    targetRevision: HEAD
    path: helm/myapp
    helm:
      parameters:
      - name: image.tag
        value: "latest"
      - name: environment
        value: "production"
  destination:
    server: https://kubernetes.default.svc
    namespace: myapp-production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

## 🔧 Context Engineering for CI/CD

### System Context Template

```markdown
# CI/CD Pipeline Context Template

## System Context Layer
- Senior DevOps Engineer with CI/CD expertise
- Security and compliance automation specialist
- Performance monitoring and optimization focus
- Infrastructure as Code and GitOps expert

## Domain Context Layer
- CI/CD Platforms: GitHub Actions, GitLab CI, Azure DevOps
- Container Orchestration: Kubernetes, Docker Swarm
- Infrastructure: Terraform, Helm, ArgoCD
- Monitoring: Prometheus, Grafana, DataDog
- Security: SAST/DAST, container scanning, compliance

## Task Context Layer
- Deployment frequency requirements (daily, hourly, on-demand)
- Quality gates and approval processes
- Security scanning and compliance requirements
- Performance and reliability targets
- Rollback and disaster recovery procedures
```

### Pipeline Testing Strategy

```yaml
# pipeline-tests.yml
name: Pipeline Tests

on:
  push:
    paths:
      - '.github/workflows/**'
      - 'scripts/**'
      - 'Dockerfile'
      - 'helm/**'

jobs:
  validate-workflows:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Validate GitHub Actions
      run: |
        for workflow in .github/workflows/*.yml; do
          echo "Validating $workflow"
          # Use act to validate workflow syntax
          act -l -W "$workflow"
        done

  test-dockerfile:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Hadolint
      uses: hadolint/hadolint-action@v3.1.0
      with:
        dockerfile: Dockerfile
        failure-threshold: error

  test-helm-charts:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Helm
      uses: azure/setup-helm@v3
    
    - name: Lint Helm charts
      run: |
        helm lint helm/myapp
        helm template myapp helm/myapp --dry-run
```

## 📚 Key Takeaways

1. **Pipeline as Code**: Version control all pipeline configurations
2. **Quality Gates**: Implement comprehensive testing and security scanning
3. **Progressive Delivery**: Use canary and blue/green deployments for safety
4. **Monitoring**: Comprehensive observability throughout the pipeline
5. **Security Integration**: Shift-left security with automated scanning
6. **Rollback Strategy**: Always have a quick rollback mechanism ready

---

**Next**: [Infrastructure as Code →](infrastructure-as-code.md)