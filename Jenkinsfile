pipeline {
    agent any

    environment {
        APP_NAME = 'smart-retail-system'
        DOCKER_IMAGE = 'smart-retail-system'
        PORT = '5000'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                sh 'npm install'
            }
        }

        stage('Code Analysis & Syntax Check') {
            steps {
                echo 'Validating backend server file...'
                sh 'node -c server.js'
                sh 'node -c data.js'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker container image...'
                sh 'docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} -t ${DOCKER_IMAGE}:latest .'
            }
        }

        stage('Deploy Container') {
            steps {
                echo 'Deploying application container via Docker Compose...'
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verifying application health...'
                sleep time: 5, unit: 'SECONDS'
                sh 'curl -f http://localhost:5000/api/products || exit 1'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up dangling Docker images...'
            sh 'docker image prune -f || true'
        }
        success {
            echo '==================================================='
            echo "SUCCESS: Smart Retail System deployed on port ${PORT}"
            echo '==================================================='
        }
        failure {
            echo '==================================================='
            echo 'FAILURE: Jenkins Pipeline Build Failed!'
            echo '==================================================='
        }
    }
}
