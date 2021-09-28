# ProjectManager (BME Onlab 2021)
Project manager based on microservice architecture

## Architecture
![Diagram of the architecture](/docs/resources/project_manager.svg)
### Services
- __User/Authentication Service__: A Java Spring Boot Application which Handels the login, logout and sign up requests. The user credentials are stored in a MySQL database.
- __Project Service__: A .Net 5 Application which provides CRUD procedures on the Project entries, stored in a MongoDB instance.
- __Meeting Service__: A .Net 5 Application which provides CRUD procedures on the Meeting entries, stored in a MongoDB instance.
- __Web Server__: A React SPA application which provides UI for the ProjectManager service. It is served with nginx.
- __Notifier Service__: A Go application which sends e-mail notifications to the members of the projects.

The services can communicate with each other over message queue (__RabbitMQ__). From outside the services are reachable through API gateway (__Traefik__).