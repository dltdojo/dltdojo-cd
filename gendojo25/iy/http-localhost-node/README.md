# http-localhost-node

This Docker Compose file defines a Node.js web server.

## Services

* **box1**: Runs a Node.js web server on port 3000 inside the container, using Node.js version 22.9.

## Running the Application

1. **Start the service:** `docker compose up -d`
2. **Access the service:** `http://localhost:8300`

The server will display "Hello, World!" along with the current date and time.

## Accessing the service via a public domain name with automatic HTTPS

1. **Get into the container shell:** `docker compose exec box1 bash`
2. **Start SSH tunneling:** `ssh -R 80:localhost:3000 serveo.net`
3. **Access the service:** `https://[your-subdomain].serveo.net`

Note: This method requires serveo.net to be available.

## Stopping the service

`docker compose down`

## Additional Information

- The container runs a simple Node.js HTTP server created inline in the Docker Compose file.
- The server listens on port 3000 inside the container, which is mapped to port 8300 on the host.
- Environment variables and the current date are printed to the console when the container starts.
