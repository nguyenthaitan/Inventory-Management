# Deployment Guide

This guide describes how to deploy the **Inventory Management System**.
- **Backend**: Deployed on [Render](https://render.com).
- **Frontend**: Deployed on [Vercel](https://vercel.com).
- **Database**: Creating a MongoDB cluster (e.g., MongoDB Atlas).

---

## 1. Database Setup (MongoDB Atlas)

Since Render does not provide a free persistent MongoDB database, it is recommended to use **MongoDB Atlas**.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/login.
2. Create a new **Cluster** (The free Shared tier is sufficient).
3. Create a **Database User**:
    - Go to **Database Access** -> **Add New Database User**.
    - Set a username and password (e.g., `admin` / `password123`).
    - **Important**: Save these credentials.
4. Allow Access:
    - Go to **Network Access** -> **Add IP Address**.
    - Select **Allow Access from Anywhere** (`0.0.0.0/0`) to allow Render to connect.
5. Get Connection String:
    - Click **Connect** -> **Drivers**.
    - Copy the connection string (e.g., `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`).
    - Replace `<password>` with your actual password.

---

## 2. Backend Deployment (Render)

We use the Blueprint file (`render.yaml`) for easy configuration.

1. **Push your code** to GitHub.
2. Login to [Render](https://dashboard.render.com/).
3. Create a new **Blueprint Instance**:
    - Click **New +** -> **Blueprint**.
    - Connect your GitHub repository.
    - Render will automatically detect the `render.yaml` file.
4. **Configure Environment Variables**:
    - You will be prompted to enter `MONGO_URI`.
    - Paste the connection string from step 1 (MongoDB Atlas).
5. **Deploy**:
    - Click **Apply**. Render will build and deploy the backend service.
6. **Get Backend URL**:
    - Once finished, copy the URL of your service (e.g., `https://inventory-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Login to [Vercel](https://vercel.com).
2. Click **Add New ...** -> **Project**.
3. Import your GitHub repository.
4. **Configure Project Settings**:
    - **Framework Preset**: Vite
    - **Root Directory**: Click `Edit` and select `02_Source/01_Source Code/frontend`.
5. **Environment Variables**:
    - Expand **Environment Variables**.
    - Add `VITE_API_URL` with the value of your Backend URL from Step 2 (e.g., `https://inventory-backend.onrender.com`).
    *Note: Do not add a trailing slash `/`.*
6. **Deploy**:
    - Click **Deploy**.
    - Vercel will install dependencies, build the project, and deploy it.

---

## 4. Verification

1. Open your Vercel URL.
2. Check if the application loads correctly.
3. Open the browser console (F12) to ensure calls to the API are going to your Render Backend (not localhost).
