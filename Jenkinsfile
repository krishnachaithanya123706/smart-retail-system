pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'smart-retail-system'
        CONTAINER_NAME = 'smart-retail-system'
        HOST_PORT = '5001'
        CONTAINER_PORT = '5000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm

                sh '''
                    echo "Current commit:"
                    git rev-parse --short HEAD
                '''
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                    test -f package.json
                    test -f package-lock.json
                    test -f server.js
                    test -f data.js
                    test -f Dockerfile
                    test -d public

                    echo "Required files found."
                    docker --version
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      --tag ${IMAGE_NAME}:${BUILD_NUMBER} \
                      --tag ${IMAGE_NAME}:latest \
                      .
                '''
            }
        }

        stage('Stop Old Container') {
            steps {
                sh '''
                    docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      --restart unless-stopped \
                      -p ${HOST_PORT}:${CONTAINER_PORT} \
                      ${IMAGE_NAME}:latest
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for application to start..."
                    sleep 5

                    docker ps \
                      --filter "name=${CONTAINER_NAME}" \
                      --filter "status=running"

                    docker port ${CONTAINER_NAME}

                    ATTEMPT=1

                    while [ "$ATTEMPT" -le 5 ]
                    do
                        if docker exec ${CONTAINER_NAME} \
                            wget -q --spider http://127.0.0.1:${CONTAINER_PORT}
                        then
                            echo "Application health check passed."
                            exit 0
                        fi

                        echo "Health-check attempt ${ATTEMPT} failed."
                        docker logs --tail 30 ${CONTAINER_NAME} || true

                        ATTEMPT=$((ATTEMPT + 1))
                        sleep 3
                    done

                    echo "Application did not become healthy."
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'Smart Retail System deployed successfully.'
            echo 'Application URL: http://localhost:5001'
        }

        failure {
            echo 'Pipeline failed. Showing container information and logs.'

            sh '''
                docker ps -a \
                  --filter "name=${CONTAINER_NAME}" || true

                docker logs --tail 100 \
                  ${CONTAINER_NAME} 2>/dev/null || true
            '''
        }

        always {
            sh '''
                docker images \
                  --filter "reference=${IMAGE_NAME}" || true
            '''
        }
    }
}