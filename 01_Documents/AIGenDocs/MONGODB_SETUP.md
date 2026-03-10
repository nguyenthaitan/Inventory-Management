# Quick MongoDB Setup Instructions

## Option 1: Install MongoDB Community Edition (Recommended)

### Download & Install:
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will start automatically as a Windows Service

### Verify Installation:
```powershell
mongod --version
```

## Option 2: Use Docker (If Docker Desktop is installed)

### Start Docker Desktop first, then run:
```powershell
docker run -d -p 27017:27017 --name mongodb mongo:7
```

## Option 3: Continue with MongoDB Atlas

### Steps to whitelist your IP:
1. Go to: https://cloud.mongodb.com/
2. Login with your Atlas account
3. Select your cluster
4. Click "Network Access" in left menu
5. Click "Add IP Address"
6. Click "Add Current IP Address"
7. Click "Confirm"
8. Wait 1-2 minutes for the change to take effect

Then restore the .env file:
```env
MONGODB_URI=mongodb+srv://pvminh1024_db_user:admin123@cluster0.igdv7pj.mongodb.net/inventory_management_db?retryWrites=true&w=majority&appName=Cluster0
```

## Current Configuration

Your `.env` is now set to use **local MongoDB on localhost:27017**.

Make sure MongoDB is running before starting the backend.
