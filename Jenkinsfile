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

        stage('Stop Old Containers') {
            steps {
                sh '''
                docker compose -f "02_Source/01_Source Code/docker-compose.yml" down || true
                '''
            }
        }

        stage('Build Docker') {
            steps {
                sh '''
                docker compose -f "02_Source/01_Source Code/docker-compose.yml" build --no-cache
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker compose -f "02_Source/01_Source Code/docker-compose.yml" up -d
                '''
            }
        }

    }

    post {

        always {

            script {

                def statusColor = currentBuild.currentResult == "SUCCESS" ? "#2da44e" : "#d1242f"
                def statusIcon = currentBuild.currentResult == "SUCCESS" ? "✅" : "❌"

                emailext(
                    mimeType: 'text/html',
                    subject: "CI/CD ${currentBuild.currentResult} - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    to: "nguyenthaitan9@gmail.com",

                    body: """
<html>

<body style="font-family:Arial;background:#f6f8fa;padding:30px">

<div style="max-width:700px;margin:auto;background:white;border-radius:8px;border:1px solid #d0d7de">

<div style="background:#24292e;color:white;padding:16px;border-radius:8px 8px 0 0">
<b>⚙️ Jenkins CI/CD Pipeline</b>
</div>

<div style="padding:20px">

<h2>${statusIcon} Build ${currentBuild.currentResult}</h2>

<table style="width:100%;border-collapse:collapse">

<tr>
<td style="padding:6px"><b>Project</b></td>
<td>${env.JOB_NAME}</td>
</tr>

<tr>
<td style="padding:6px"><b>Build</b></td>
<td>#${env.BUILD_NUMBER}</td>
</tr>

<tr>
<td style="padding:6px"><b>Status</b></td>
<td>
<span style="
background:${statusColor};
color:white;
padding:5px 12px;
border-radius:5px;
font-weight:bold
">
${currentBuild.currentResult}
</span>
</td>
</tr>

<tr>
<td style="padding:6px"><b>Branch</b></td>
<td>${env.GIT_BRANCH}</td>
</tr>

<tr>
<td style="padding:6px"><b>Commit</b></td>
<td>${env.GIT_COMMIT}</td>
</tr>

<tr>
<td style="padding:6px"><b>Build URL</b></td>
<td>
<a href="${env.BUILD_URL}">
${env.BUILD_URL}
</a>
</td>
</tr>

</table>

<br>

<a href="${env.BUILD_URL}"
style="
background:#2da44e;
color:white;
padding:10px 16px;
border-radius:6px;
text-decoration:none;
font-weight:bold
">
View Build
</a>

<hr>

<p style="color:gray;font-size:12px">
Jenkins CI/CD Notification
</p>

</div>
</div>

</body>
</html>
"""
                )

            }

        }

    }

}