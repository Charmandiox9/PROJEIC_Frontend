pipeline {
    agent any
    
    environment {
        GITHUB_CREDENTIAL_ID = 'github-token'
        IMAGE_NAME = 'projeic_frontend'
    }

    stages {
        stage('Clonar y Preparar') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Construir Frontend') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Actualizar Producción') {
            steps {
                sh 'podman-compose up -d --no-deps frontend'
                sh 'podman image prune -f'
            }
        }
    }
}
