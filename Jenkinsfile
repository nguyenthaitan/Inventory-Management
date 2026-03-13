pipeline {
    agent any

    stages {

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