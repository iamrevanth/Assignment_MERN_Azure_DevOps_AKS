# Assignment 11 DevOps

# MERN Microservices Deployment on Azure Kubernetes Service (AKS)

This project demonstrates deploying a **MERN application** (React frontend + Node.js microservices + MongoDB Atlas) on **Azure Kubernetes Service (AKS)** with CI/CD using **Azure Pipelines**.

---

## 📌 Application Architecture

- **Frontend (React App)** → `/frontend`
  - Port: `3000`
  - Routes:
    - `/` → React frontend
    - `/hellohealth`, `/hellohome` → backend Hello service
    - `/profilehealth`, `/profilehome`, `/fetchUser` → backend Profile service
  - Environment Variables:
    ```env
    REACT_APP_HELLO_BASE_URL=http://localhost:3001
    REACT_APP_PROFILE_BASE_URL=http://localhost:3002
    ```

- **Backend Microservices**
  - **Hello Service** → `/backend/helloService`
    - Port: `3001`
    - Env:
      ```env
      PORT=3001
      ```
  - **Profile Service** → `/backend/profileService`
    - Port: `3002`
    - Env:
      ```env
      PORT=3002
      MONGO_URL="mongodb+srv://id:password@cluster0.aq7nu.mongodb.net/assignment_nine"
      ```

---

## 🚀 Deployment Guide

### 1. Clone Repository
```bash
git clone https://github.com/UnpredictablePrashant/SampleMERNwithMicroservices.git
cd SampleMERNwithMicroservices
```

### 2. Create Azure Resources

# Resource Group

```bash
az group create --name mern-rg --location eastus
```

# AKS Cluster

```bash
az aks create \
  --resource-group mern-rg \
  --name aks-app-jl \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys
```
# ACR (Azure Container Registry)

```bash
az acr create --resource-group mern-rg --name mernacr12345 --sku Basic
```

# Attach ACR to AKS

```bash
az aks update -n mern-aks-cluster -g mern-rg --attach-acr mernacr12345
```

### 3. Connect to AKS

```bash
az aks get-credentials --resource-group mern-rg --name mern-aks-cluster
```

### 4. Build & Push Docker Images

# Frontend

```bash
docker build -t mernacr12345.azurecr.io/frontend:latest ./frontend
docker push mernacr12345.azurecr.io/frontend:latest
```

# Hello Service

```bash
docker build -t mernacr12345.azurecr.io/hello-service:latest ./backend/helloService
docker push mernacr12345.azurecr.io/hello-service:latest
```

# Profile Service

```bash
docker build -t mernacr12345.azurecr.io/profile-service:latest ./backend/profileService
docker push mernacr12345.azurecr.io/profile-service:latest
```

### 5. Kubernetes Manifests

Create a folder k8s/ and save the following manifests:
k8s/frontend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: mernacr12345.azurecr.io/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_HELLO_BASE_URL
          value: "http://hello-service:3001"
        - name: REACT_APP_PROFILE_BASE_URL
          value: "http://profile-service:3002"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: frontend

```

k8s/hello-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-service
  template:
    metadata:
      labels:
        app: hello-service
    spec:
      containers:
      - name: hello-service
        image: mernacr12345.azurecr.io/hello-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: PORT
          value: "3001"
---
apiVersion: v1
kind: Service
metadata:
  name: hello-service
spec:
  type: ClusterIP
  ports:
  - port: 3001
    targetPort: 3001
  selector:
    app: hello-service

```

k8s/profile-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: profile-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: profile-service
  template:
    metadata:
      labels:
        app: profile-service
    spec:
      containers:
      - name: profile-service
        image: mernacr12345.azurecr.io/profile-service:latest
        ports:
        - containerPort: 3002
        env:
        - name: PORT
          value: "3002"
        - name: MONGO_URL
          value: "mongodb+srv://id:password@cluster0.aq7nu.mongodb.net/assignment_nine"
---
apiVersion: v1
kind: Service
metadata:
  name: profile-service
spec:
  type: ClusterIP
  ports:
  - port: 3002
    targetPort: 3002
  selector:
    app: profile-service

```

### 6. Deploy to AKS

```bash
kubectl apply -f k8s/
```

### 7. Verify Deployment
```bash
kubectl get pods
kubectl get svc
```

### 8. Access Application

Get the EXTERNAL-IP of the frontend service:

kubectl get svc frontend

- http://EXTERNAL-IP/
- http://EXTERNAL-IP/hellohealth
- http://EXTERNAL-IP/profilehealth

## 📸 Screenshots:

<img width="1912" height="962" alt="image" src="https://github.com/user-attachments/assets/8ad0c898-0a06-48f7-b3b0-5a5b4b888192" />
<img width="1918" height="240" alt="image" src="https://github.com/user-attachments/assets/1bde9e28-8658-4a14-a030-c8f3963455a0" />
<img width="1918" height="261" alt="image" src="https://github.com/user-attachments/assets/3013381c-a190-42f4-8072-1739086736a4" />
<img width="1915" height="247" alt="image" src="https://github.com/user-attachments/assets/41107ea1-fd08-4be8-8ec2-a25652778d43" />
<img width="1918" height="242" alt="image" src="https://github.com/user-attachments/assets/14bc98f2-9a09-4c60-b9d3-70340bb5ffb0" />
<img width="1918" height="347" alt="image" src="https://github.com/user-attachments/assets/08dfbcae-b20a-4583-970a-4c178f87f3e3" />


---

## 📜 License
This project is licensed under the MIT License.

## 🤝 Contributing
Feel free to fork and improve the scripts! ⭐ If you find this project useful, please consider starring the repo—it really helps and supports my work! 😊

## 📧 Contact
For any queries, reach out via GitHub Issues.

---

🎯 **Thank you for reviewing this project! 🚀**
