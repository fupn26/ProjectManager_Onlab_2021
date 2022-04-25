# Start services in Kubernetes cluster
## Prequisites
- Kubernetes
    - Docker Desktop
    - minikube
- Helm
- Docker-compose
## *Using Kubernetes dashboard
1. ```kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/aio/deploy/alternative.yaml```
2. [Create sample user](https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/creating-sample-user.md)
3. ```kubectl proxy```
4. Open link: [http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/kubernetes-dashboard:/proxy/](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/kubernetes-dashboard:/proxy/)

## Creating Kubernetes Secrets
For using the yaml descriptors in ```Kubernetes``` directory, you have to create multiple secret files.
### Secrects for Databases
Create these files in ```Kubernetes/secret``` directory
#### MySQL secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: kubernetes.io/basic-auth
stringData:
  db_name: # the name of the database which will store the users
  username: # the user which will be used for database connection
  user_password:
  root_password: # During the initialization of the mysql container, a root user is created. This will be the password of this generated root user.
```
### Secrets for Services
Create these files in ```Kubernetes/secret``` directory
#### RabbitMq secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: rabbitmq-secret
type: kubernetes.io/basic-auth
stringData:
  username: # your value
  user_password: # your value
```
### Secrets for App
Create these files in ```Kubernetes/app``` directory
#### Mail Service secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mail-secret
type: Opaque
stringData:
  sendgrid_api_key: # your value
  sendgrid_sender_name: # your value
  sendgrid_sender_email: # your value
```
#### User Service secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: users-secret
type: kubernetes.io/basic-auth
stringData:
  jwt_secret: # value which is used for generating JWT tokens
  admin_password: # the password of the deafult admin user
```

## Install Secrets
1. Navigate to ```Kubernetes``` directory
2. ```kubectl apply -f secret```

## Install Ingress Controller
1. ```helm repo add traefik https://helm.traefik.io/traefik```
2. ```helm repo update```
3. ```helm install traefik traefik/traefik --set ports.web.nodePort=32080 --set service.type=NodePort```
    - The services will be available through port ```32080```
4. ```kubectl port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000```
    - __Caution__: It should be authenticated. Use this solution only in dev enviroment.
## Install Databases
1. Navigate to ```Kubernetes``` directory
2. ```kubectl apply -f db```
## Install Services
1. Navigate to ```Kubernetes``` directory
2. ```kubectl apply -f service```
    - Currently it contains only the RabbitMq service descriptor.
## Install App
1. Set the ```IMAGE_TAG``` enviromental variable to ```v1```
2. Navigate to ```Docker``` directory
3. ```docker-compose build```
4. Navigate to ```Kubernetes``` dierctory
5. ```kubectl apply -f app```