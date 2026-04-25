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
                // 1. Recrear el contenedor con el código nuevo
                sh '''
                docker run --rm \
                  -v /var/www/projeic:/var/www/projeic \
                  -v /run/user/1000/podman/podman.sock:/var/run/docker.sock \
                  -w /var/www/projeic \
                  docker.io/docker/compose:1.29.2 \
                  -f docker-compose.yml up -d --force-recreate --no-deps frontend
                '''
                
                // 2. Reiniciamos el proxy usando el nombre real del contenedor
                sh 'docker restart projeic_nginx_1 || true'
                
                // 3. Limpieza suave (si falla, no rompe el pipeline)
                sh 'docker image prune -f || true'
            }
        }
    }
}
