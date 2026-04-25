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
                // 1. Apagamos el proxy (el escudo) temporalmente
                sh 'docker stop nginx || true'
                
                // 2. Destruimos y recreamos el frontend
                sh 'docker rm -f frontend || true'
                sh 'docker run -d --name frontend --network projeic_default -p 3000:3000 projeic_frontend:latest'
                
                // 3. Volvemos a encender el proxy
                sh 'docker start nginx || true'
                
                // 4. Limpieza de imágenes viejas
                sh 'docker image prune -f'
            }
        }
    }
}
