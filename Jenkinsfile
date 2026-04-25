pipeline {
    agent any
    
    environment {
        GITHUB_CREDENTIAL_ID = 'github-token'
        IMAGE_NAME = 'projeic_frontend'
        DOCKER_BUILDKIT = '0'
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
                sh 'docker rm -f buildx_buildkit_default || true'
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Actualizar Producción') {
            steps {
                sh '''
                docker run --rm \
                  -v /var/www/projeic:/var/www/projeic \
                  -v /run/user/1000/podman/podman.sock:/var/run/docker.sock \
                  -w /var/www/projeic \
                  docker.io/docker/compose:1.29.2 \
                  -f docker-compose.yml up -d --no-deps frontend
                '''
                sh 'docker image prune -f'
            }
        }
    }
}
