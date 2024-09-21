## HTTP Localhost SSH Node

This project demonstrates running a simple HTTP server inside a Docker container using Docker Compose.

### Services

The `compose.yaml` file defines two services:

* **box101**: This service runs a busybox container, which acts as a simple HTTP server. It serves an HTML page with a simple message.
* **box201**: This service runs a Node.js container, which is used for debugging and demonstrating SSH access within the container. It also provides an example of using a service like `serveo.net` to expose a local web server via a public domain name with automatic HTTPS.

### Running the Project

To run the project, execute the following commands:

1. **Build and start the containers**: `docker-compose up -d`
2. **Access the HTTP server**: Open your browser and navigate to `http://localhost:8300`

### SSH Tunneling

To get a shell from the `box201` container, you can use the following commands:

1. **Connect to the container using docker-compose exec**: `docker-compose exec box201 bash`
2. **Establish an SSH tunnel to the `box101` container**: `ssh -R 80:box101:3000 serveo.net`
3. **Access the `box101` container's HTTP server**: Open your browser and navigate to `https://xxxxxx.serveo.net` (replace `xxxxxx` with the actual domain name provided by `serveo.net`).

### Additional Notes

* This project is designed for demonstration purposes and can be extended to include more complex functionality.
* You can modify the `compose.yaml` file to change the services, ports, or other settings.
* Refer to the Docker Compose documentation for more information: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
