# http-localhost-node

This project sets up a simple Node.js web server using Docker Compose.

## Services

* **box1**: Runs a Node.js web server using Node.js version 22.9.

## Application Details

The application is a simple HTTP server created using Node.js. It responds to all requests with "Hello, World!" followed by the current date and time.

Key points:
- The server is defined in `app.js`
- It listens on port 3000 inside the container
- The response includes a greeting and the current date/time

## Running the Application

1. **Start the service:** 
   ```
   docker compose up -d
   ```
2. **Access the service:** 
   ```
   http://localhost:8300
   ```

## Accessing the service via a public domain name with automatic HTTPS

This method requires serveo.net to be available.

1. **Get into the container shell:** 
   ```
   docker compose exec box1 bash
   ```
2. **Start SSH tunneling:** 
   ```
   ssh -R 80:localhost:3000 serveo.net
   ```
3. **Access the service:** 
   ```
   https://[your-subdomain].serveo.net
   ```

## Stopping the service

To stop the service, run:
```
docker compose down
```

## Additional Information

- The server listens on port 3000 inside the container, which is mapped to port 8300 on the host.
- Environment variables and the current date are printed to the console when the container starts.
- The `app.js` file is mounted as a read-only volume inside the container, allowing for easy updates without rebuilding the image.

## File Structure

- `compose.yaml`: Defines the Docker service configuration
- `app.js`: Contains the Node.js server code
- `README.md`: This file, providing project documentation
