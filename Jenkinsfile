pipeline {
    agent any

    // Automated Triggers: GitHub Webhook Push + SCM Polling every 5 minutes
    triggers {
        githubPush()
        pollSCM('H/5 * * * *')
    }

    environment {
        APP_NAME = 'smart-retail-system'
        DOCKER_IMAGE = 'smart-retail-system'
        PORT = '5000'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo '⚡ Automated Trigger Detected: Checking out latest code from GitHub...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Node.js production dependencies...'
                sh 'npm install'
            }
        }

        stage('Code Analysis & Syntax Check') {
            steps {
                echo '🔍 Validating JavaScript syntax...'
                sh 'node -c server.js'
                sh 'node -c data.js'
            }
        }

        stage('Build & Tag Docker Image') {
            steps {
                echo '🐳 Building updated Docker container image...'
                sh 'docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} -t ${DOCKER_IMAGE}:latest .'
            }
        }

        stage('Automated Deployment') {
            steps {
                echo '🚀 Redeploying updated application container via Docker Compose...'
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo '🩺 Running endpoint health check verification...'
                sleep time: 5, unit: 'SECONDS'
                sh 'curl -f http://localhost:5000/api/products || exit 1'
            }
        }
    }

    post {
        always {
            echo '🧹 Pruning old unused Docker layers...'
            sh 'docker image prune -f || true'
        }
        success {
            echo '========================================================================'
            echo "✅ AUTOMATION SUCCESS: Updated Smart Retail System deployed at :${PORT}"
            echo '========================================================================'
        }
        failure {
            echo '========================================================================'
            echo '❌ AUTOMATION FAILURE: Pipeline build failed. Rolling back or inspect logs.'
            echo '========================================================================'
        }
    }
}
