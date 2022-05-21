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
type: Opaque
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
type: Opaque
stringData:
  username: # your value
  user_password: # your value
```
### Secrets for App
Create these files in ```Kubernetes/secret``` directory
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
type: Opaque
stringData:
  jwt_secret: # value which is used for generating JWT tokens
  admin_password: # the password of the deafult admin user
```

## Install Secrets
1. Navigate to ```Kubernetes``` directory
2. ```kubectl apply -f secret```

## Install Databases
1. Navigate to ```Kubernetes``` directory
2. ```kubectl apply -f db```

## Install Jaeger
1. ```helm repo add jaegertracing https://jaegertracing.github.io/helm-charts```
2. ```helm repo update```
3. Install jaeger with helm:
```bash
helm install jaeger 
  jaegertracing/jaeger \
    --set provisionDataStore.cassandra=false \
    --set storage.type=elasticsearch \
    --set storage.elasticsearch.host=elasticsearch \
    --set storage.elasticsearch.port=9200
```
4. Acessing UI from outside:
```bash
$ export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/instance=jaeger,app.kubernetes.io/component=query" -o jsonpath="{.items[0].metadata.name}")

$ kubectl port-forward --namespace default $POD_NAME 8080:16686
```

## Install Ingress Controller
0. Navigate to ```Kubernetes``` directory
1. ```helm repo add traefik https://helm.traefik.io/traefik```
2. ```helm repo update```
3. ```helm install traefik traefik/traefik --values traefik/values.yaml```
    - The services will be available through port ```32080```
    - In case if you are using ```minikube```, you need to create a tunnel to the cluster:
      ```bash
      minikube service traefik --url
      ```
4. ```kubectl port-forward $(kubectl get pods --selector "app.kubernetes.io/name=traefik" --output=name) 9000:9000```
    - __Caution__: It should be authenticated. Use this solution only in dev enviroment.

## Install Services
1. Navigate to ```Kubernetes``` directory
2. ```kubectl apply -f service```

## Install App
1. Set the ```IMAGE_TAG``` and the ```KEYCLOAK_BASE_URL``` environmantal variables
    - __Linux__:
    ```bash
    export IMAGE_TAG=v1
    export KEYCLOAK_BASE_URL=http://<YOUR_CHOOSED_HOSTNAME>:32080/keycloak
    ```
    - __Windows__:
    ```ps
    $env:IMAGE_TAG = 'v1'
    $env:KEYCLOAK_BASE_URL = 'http://<YOUR_CHOSED_HOSTNAME>:32080/keycloak'
    ```
    - __Caution__: It is really important to rebuild at least the ```web``` service in case you want to change the keycloak base url.
2. Navigate to ```Docker``` directory
3. ```docker-compose -f docker-compose.dev.yml build```
4. Navigate to ```Kubernetes``` dierctory
5. ```helm upgrade microproject --install microproject```
    - The defualt value of ```tag``` is ```v1``` for each service image in the [values.yaml](microproject/values.yaml). If you want to change these values you can either change them in the file or add ```--set <service_name>.tag``` for each service. 