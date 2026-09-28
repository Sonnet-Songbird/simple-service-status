pipeline {
    agent any
    environment {
        IMAGE_NAME = 'service-status-notice'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }
    stages {
        stage('Install') {
            steps { sh 'npm ci' }
        }
        stage('Lint & Typecheck') {
            steps { sh 'npm run lint && npm run typecheck' }
        }
        stage('Test') {
            steps { sh 'npm test' }
        }
        stage('Contract Drift Check') {
            steps { sh 'npm run check:contract-drift' }
        }
        stage('Build Image') {
            steps { sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .' }
        }
        stage('Deploy') {
            steps {
                sh '''
                    cp docker-compose.yml /opt/service-status-notice/docker-compose.yml
                    cd /opt/service-status-notice
                    docker compose up -d --force-recreate
                '''
            }
        }
        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 5
                    curl -sf "http://127.0.0.1:4100/api/v1/status?service=__nonexistent__" -o /dev/null -w "%{http_code}" | grep -q 404
                '''
            }
        }
    }
}
