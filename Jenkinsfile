pipeline {
    agent any

    stages {

        stage('Prepare ENV') {
            steps {
                sh '''
                cp "/home/ubuntu/codes/Inventory-Management/02_Source/01_Source Code/backend/.env" \
                "02_Source/01_Source Code/backend/.env"
                '''
            }
        }

        stage('Build Docker') {
            steps {
                sh '''
                docker-compose -f "02_Source/01_Source Code/docker-compose.yml" build
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker-compose -f "02_Source/01_Source Code/docker-compose.yml" up -d
                '''
            }
        }

    }
}