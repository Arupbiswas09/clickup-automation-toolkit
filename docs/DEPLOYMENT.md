# Deployment Guide

This guide covers various deployment options for the ClickUp Automation Toolkit.

## Table of Contents

- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD Integration](#cicd-integration)
- [Environment Configuration](#environment-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites

- Node.js 16+ (recommended: 18+)
- npm or yarn
- ClickUp API access

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/clickup-automation-toolkit.git
   cd clickup-automation-toolkit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your ClickUp credentials
   ```

4. **Run setup script:**
   ```bash
   npm run setup
   ```

5. **Test the installation:**
   ```bash
   npm test
   npm run test:cli
   ```

### Development Commands

```bash
# Start development mode with file watching
npm run dev

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking (if using TypeScript)
npm run type-check
```

## Production Deployment

### Server Requirements

- **OS:** Linux (Ubuntu 20.04+ recommended), macOS, or Windows Server
- **Node.js:** 18+ (LTS recommended)
- **Memory:** Minimum 512MB RAM
- **Storage:** 100MB+ free space
- **Network:** HTTPS access to ClickUp API

### Installation Steps

1. **Prepare the server:**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js (using NodeSource repository)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Create application user:**
   ```bash
   sudo useradd -m -s /bin/bash clickup-automation
   sudo su - clickup-automation
   ```

3. **Deploy application:**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/clickup-automation-toolkit.git
   cd clickup-automation-toolkit
   
   # Install production dependencies
   npm ci --only=production
   
   # Create production configuration
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Configure environment:**
   ```bash
   # Set production environment
   echo "NODE_ENV=production" >> .env
   
   # Set up logging directory
   mkdir -p logs
   chmod 755 logs
   ```

5. **Test deployment:**
   ```bash
   npm run test:connection
   npm run validate
   ```

### Process Management

#### Using PM2 (Recommended)

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 configuration:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'clickup-automation',
       script: './bin/clickup-cli.js',
       args: 'daemon',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

3. **Start application:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Using systemd

1. **Create service file:**
   ```ini
   # /etc/systemd/system/clickup-automation.service
   [Unit]
   Description=ClickUp Automation Toolkit
   After=network.target
   
   [Service]
   Type=simple
   User=clickup-automation
   WorkingDirectory=/home/clickup-automation/clickup-automation-toolkit
   ExecStart=/usr/bin/node bin/clickup-cli.js daemon
   Restart=always
   RestartSec=10
   Environment=NODE_ENV=production
   EnvironmentFile=/home/clickup-automation/clickup-automation-toolkit/.env
   
   [Install]
   WantedBy=multi-user.target
   ```

2. **Enable and start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable clickup-automation
   sudo systemctl start clickup-automation
   sudo systemctl status clickup-automation
   ```

## Docker Deployment

### Single Container

1. **Build image:**
   ```bash
   docker build -t clickup-automation .
   ```

2. **Run container:**
   ```bash
   docker run -d \
     --name clickup-automation \
     --restart unless-stopped \
     -e CLICKUP_API_KEY=your_api_key \
     -e CLICKUP_TEAM_ID=your_team_id \
     -e CLICKUP_LIST_ID=your_list_id \
     -v $(pwd)/logs:/app/logs \
     -v $(pwd)/config:/app/config \
     clickup-automation
   ```

### Docker Compose

1. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   
   services:
     clickup-automation:
       build: .
       container_name: clickup-automation
       restart: unless-stopped
       environment:
         - NODE_ENV=production
       env_file:
         - .env
       volumes:
         - ./logs:/app/logs
         - ./config:/app/config
       networks:
         - clickup-network
   
     # Optional: Add Redis for caching
     redis:
       image: redis:7-alpine
       container_name: clickup-redis
       restart: unless-stopped
       volumes:
         - redis_data:/data
       networks:
         - clickup-network
   
   volumes:
     redis_data:
   
   networks:
     clickup-network:
       driver: bridge
   ```

2. **Deploy with compose:**
   ```bash
   docker-compose up -d
   ```

### Docker Swarm

1. **Initialize swarm:**
   ```bash
   docker swarm init
   ```

2. **Create stack file:**
   ```yaml
   # docker-stack.yml
   version: '3.8'
   
   services:
     clickup-automation:
       image: clickup-automation:latest
       deploy:
         replicas: 2
         restart_policy:
           condition: on-failure
           delay: 5s
           max_attempts: 3
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
       environment:
         - NODE_ENV=production
       secrets:
         - clickup_api_key
         - clickup_team_id
       networks:
         - clickup-network
   
   secrets:
     clickup_api_key:
       external: true
     clickup_team_id:
       external: true
   
   networks:
     clickup-network:
       driver: overlay
   ```

3. **Deploy stack:**
   ```bash
   # Create secrets
   echo "your_api_key" | docker secret create clickup_api_key -
   echo "your_team_id" | docker secret create clickup_team_id -
   
   # Deploy stack
   docker stack deploy -c docker-stack.yml clickup
   ```

## Cloud Deployment

### AWS EC2

1. **Launch EC2 instance:**
   - AMI: Ubuntu 20.04 LTS
   - Instance type: t3.micro (for basic usage)
   - Security group: Allow SSH (22) and HTTP (80)

2. **Connect and setup:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Follow production deployment steps above
   ```

3. **Configure load balancer (optional):**
   ```bash
   # Install nginx
   sudo apt install nginx
   
   # Configure reverse proxy
   sudo nano /etc/nginx/sites-available/clickup-automation
   ```

### AWS ECS

1. **Create task definition:**
   ```json
   {
     "family": "clickup-automation",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "clickup-automation",
         "image": "your-account.dkr.ecr.region.amazonaws.com/clickup-automation:latest",
         "essential": true,
         "environment": [
           {"name": "NODE_ENV", "value": "production"}
         ],
         "secrets": [
           {"name": "CLICKUP_API_KEY", "valueFrom": "arn:aws:secretsmanager:region:account:secret:clickup-api-key"},
           {"name": "CLICKUP_TEAM_ID", "valueFrom": "arn:aws:secretsmanager:region:account:secret:clickup-team-id"}
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/clickup-automation",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

### Google Cloud Run

1. **Build and push image:**
   ```bash
   # Build for Cloud Run
   docker build -t gcr.io/your-project/clickup-automation .
   docker push gcr.io/your-project/clickup-automation
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy clickup-automation \
     --image gcr.io/your-project/clickup-automation \
     --platform managed \
     --region us-central1 \
     --set-env-vars NODE_ENV=production \
     --set-secrets CLICKUP_API_KEY=clickup-api-key:latest \
     --set-secrets CLICKUP_TEAM_ID=clickup-team-id:latest
   ```

### Azure Container Instances

1. **Create resource group:**
   ```bash
   az group create --name clickup-automation --location eastus
   ```

2. **Deploy container:**
   ```bash
   az container create \
     --resource-group clickup-automation \
     --name clickup-automation \
     --image your-registry/clickup-automation:latest \
     --environment-variables NODE_ENV=production \
     --secure-environment-variables \
       CLICKUP_API_KEY=your_api_key \
       CLICKUP_TEAM_ID=your_team_id \
     --restart-policy Always
   ```

## CI/CD Integration

### GitHub Actions

The repository includes a comprehensive CI/CD pipeline in `.github/workflows/ci.yml`:

- **Continuous Integration:**
  - Automated testing on multiple Node.js versions
  - Code quality checks (ESLint)
  - Security audits
  - Docker image building

- **Continuous Deployment:**
  - Automatic NPM publishing on releases
  - Docker image publishing to registries
  - Integration testing

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run lint
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - curl -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d '{"image":"'$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA'"}'
  only:
    - main
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'your-registry.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm test'
                    }
                }
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Security Audit') {
                    steps {
                        sh 'npm audit --audit-level=moderate'
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${DOCKER_REGISTRY}/clickup-automation:${BUILD_NUMBER}")
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    docker service update \
                        --image ${DOCKER_REGISTRY}/clickup-automation:${BUILD_NUMBER} \
                        clickup-automation
                '''
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            ])
        }
    }
}
```

## Environment Configuration

### Production Environment Variables

```bash
# Core Configuration
NODE_ENV=production
CLICKUP_API_KEY=your_production_api_key
CLICKUP_TEAM_ID=your_team_id
CLICKUP_LIST_ID=your_default_list_id
CLICKUP_DEFAULT_ASSIGNEE=your_user_id

# Optional Configuration
DEBUG=false
LOG_LEVEL=info
API_RATE_LIMIT=100
API_TIMEOUT=30000

# Monitoring
HEALTH_CHECK_PORT=3001
METRICS_PORT=3002

# External Services
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/clickup

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
```

### Configuration Validation

```bash
# Validate configuration
npm run validate:config

# Test all connections
npm run test:connections

# Health check
npm run health-check
```

## Monitoring and Logging

### Application Monitoring

1. **Health Checks:**
   ```javascript
   // Built-in health check endpoint
   GET /health
   
   // Response
   {
     "status": "healthy",
     "timestamp": "2023-12-07T10:00:00Z",
     "uptime": 3600,
     "clickup": "connected",
     "memory": {
       "used": "45MB",
       "total": "512MB"
     }
   }
   ```

2. **Metrics Collection:**
   ```bash
   # Enable metrics collection
   export ENABLE_METRICS=true
   export METRICS_PORT=3002
   
   # Access metrics
   curl http://localhost:3002/metrics
   ```

### Logging Configuration

```javascript
// config/logging.js
export default {
  level: process.env.LOG_LEVEL || 'info',
  format: 'json',
  transports: [
    {
      type: 'console',
      colorize: true
    },
    {
      type: 'file',
      filename: 'logs/app.log',
      maxSize: '10MB',
      maxFiles: 5
    },
    {
      type: 'file',
      filename: 'logs/error.log',
      level: 'error',
      maxSize: '10MB',
      maxFiles: 5
    }
  ]
};
```

### External Monitoring

#### Prometheus + Grafana

1. **Prometheus configuration:**
   ```yaml
   # prometheus.yml
   scrape_configs:
     - job_name: 'clickup-automation'
       static_configs:
         - targets: ['localhost:3002']
   ```

2. **Grafana dashboard:**
   - Import dashboard ID: `clickup-automation-dashboard`
   - Monitor API response times, error rates, task creation metrics

#### ELK Stack

1. **Logstash configuration:**
   ```ruby
   input {
     file {
       path => "/app/logs/*.log"
       type => "clickup-automation"
     }
   }
   
   filter {
     if [type] == "clickup-automation" {
       json {
         source => "message"
       }
     }
   }
   
   output {
     elasticsearch {
       hosts => ["elasticsearch:9200"]
       index => "clickup-automation-%{+YYYY.MM.dd}"
     }
   }
   ```

## Troubleshooting

### Common Issues

1. **API Connection Failures:**
   ```bash
   # Check API key validity
   npm run test:connection
   
   # Verify network connectivity
   curl -H "Authorization: Bearer $CLICKUP_API_KEY" \
        https://api.clickup.com/api/v2/team
   ```

2. **Permission Errors:**
   ```bash
   # Check file permissions
   ls -la logs/
   chmod 755 logs/
   chown -R clickup-automation:clickup-automation logs/
   ```

3. **Memory Issues:**
   ```bash
   # Monitor memory usage
   npm run monitor:memory
   
   # Increase memory limit
   export NODE_OPTIONS="--max-old-space-size=1024"
   ```

4. **Rate Limiting:**
   ```bash
   # Check rate limit status
   npm run check:rate-limit
   
   # Adjust rate limiting
   export API_RATE_LIMIT=50
   export API_RATE_WINDOW=60000
   ```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=clickup:*
export LOG_LEVEL=debug

# Run with debug output
npm run debug

# Trace API calls
export TRACE_API_CALLS=true
```

### Performance Optimization

1. **Connection Pooling:**
   ```javascript
   // Enable connection pooling
   export const config = {
     http: {
       keepAlive: true,
       maxSockets: 10,
       timeout: 30000
     }
   };
   ```

2. **Caching:**
   ```bash
   # Enable Redis caching
   export ENABLE_CACHE=true
   export REDIS_URL=redis://localhost:6379
   export CACHE_TTL=300
   ```

3. **Batch Processing:**
   ```bash
   # Configure batch sizes
   export BATCH_SIZE=10
   export BATCH_DELAY=1000
   ```

### Log Analysis

```bash
# View recent errors
tail -f logs/error.log

# Search for specific issues
grep "API_ERROR" logs/app.log

# Analyze performance
grep "response_time" logs/app.log | awk '{print $5}' | sort -n
```

### Recovery Procedures

1. **Service Recovery:**
   ```bash
   # Restart service
   pm2 restart clickup-automation
   
   # Or with systemd
   sudo systemctl restart clickup-automation
   ```

2. **Database Recovery:**
   ```bash
   # Clear cache
   redis-cli FLUSHALL
   
   # Reset configuration
   npm run reset:config
   ```

3. **Full Reset:**
   ```bash
   # Stop all services
   pm2 stop all
   
   # Clear logs
   rm -rf logs/*
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   
   # Restart
   pm2 start ecosystem.config.js
   ```

For additional support, please check the [GitHub Issues](https://github.com/your-username/clickup-automation-toolkit/issues) or contact the maintainers.