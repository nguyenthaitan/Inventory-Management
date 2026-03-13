pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git branch: 'main',
                url: 'https://github.com/nguyenthaitan/Inventory-Management.git'
            }
        }

        stage('Build Docker') {
            steps {
                sh 'docker compose -f "02_Source/01_Source Code/docker-compose.yml" build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose -f "02_Source/01_Source Code/docker-compose.yml" down'
                sh 'docker compose -f "02_Source/01_Source Code/docker-compose.yml" up -d'
            }
        }

    }
}