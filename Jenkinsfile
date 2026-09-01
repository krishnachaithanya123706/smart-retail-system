pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                    test -f package.json
                    test -f package-lock.json
                    test -f server.js
                    test -f Dockerfile
                    docker --version
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      --tag smart-retail-system:${BUILD_NUMBER} \
                      --tag smart-retail-system:latest \
                      .
                '''
            }
        }

        stage('Stop Old Container') {
            steps {
                sh '''
                    docker rm -f smart-retail-system 2>/dev/null || true
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                    docker run -d \
                      --name smart-retail-system \
                      --restart unless-stopped \
                      -p 5000:5000 \
                      smart-retail-system:latest
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    sleep 5
                    docker ps --filter "name=smart-retail-system"
                    docker logs smart-retail-system
                    wget --spider --tries=5 \
                      --waitretry=2 \
                      http://host.docker.internal:5000
                '''
            }
        }
    }

    post {
        success {
            echo 'Smart Retail System deployed successfully.'
            echo 'Open: http://localhost:5000'
        }

        failure {
            echo 'Pipeline failed. Displaying application logs:'
            sh 'docker logs smart-retail-system 2>/dev/null || true'
        }

        always {
            sh 'docker ps --filter "name=smart-retail-system" || true'
        }
    }
}