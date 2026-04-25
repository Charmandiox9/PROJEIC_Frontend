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
                // El agente recrea SOLO el frontend y vuelve a conectar sus dependencias
                sh '''
                docker run --rm \
                  -v /var/www/projeic:/var/www/projeic \
                  -v /run/user/1000/podman/podman.sock:/var/run/docker.sock \
                  -w /var/www/projeic \
                  docker.io/docker/compose:1.29.2 \
                  -f docker-compose.yml up -d --force-recreate --no-deps frontend
                '''
                
                // Reiniciamos Nginx para que "vea" el nuevo frontend
                sh 'docker restart nginx || true'
                
                // Limpiamos imágenes viejas
                sh 'docker image prune -f'
            }
        }
    }
}
