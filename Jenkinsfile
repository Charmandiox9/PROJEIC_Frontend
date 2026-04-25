pipeline {
    agent any
    
    environment {
        GITHUB_CREDENTIAL_ID = 'github-token'
        IMAGE_NAME = 'projeic_frontend'
        // Desactivamos BuildKit para evitar bloqueos internos en Podman
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
                // Limpieza del contenedor fantasma de construcción (ignorando errores)
                sh 'docker rm -f buildx_buildkit_default || true'
                // Compilación de Next.js
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Actualizar Producción') {
            steps {
                // 1. El agente temporal reemplaza SOLO el frontend sin tocar sus dependencias
                sh '''
                docker run --rm \
                  -v /var/www/projeic:/var/www/projeic \
                  -v /run/user/1000/podman/podman.sock:/var/run/docker.sock \
                  -w /var/www/projeic \
                  docker.io/docker/compose:1.29.2 \
                  -f docker-compose.yml up -d --force-recreate --no-deps frontend
                '''
                
                // 2. Reiniciamos el proxy Nginx para que detecte el nuevo frontend
                sh 'docker restart nginx || true'
                
                // 3. Limpieza de disco suave para no llenar la VM con imágenes viejas
                sh 'docker image prune -f || true'
            }
        }
    }
}
