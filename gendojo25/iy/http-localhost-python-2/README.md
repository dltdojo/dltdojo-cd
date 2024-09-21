# Docker Compose Setup for HTTP Server

This setup uses Docker Compose to create a Python 3 environment and run an HTTP server.

## Prerequisites

* Docker installed on your system
* Docker Compose installed on your system

## Usage

1. Run `docker compose up` to start the container.
2. Access the HTTP server at `http://localhost:8300`.

## Container Details

* Image: `python:3-bookworm`
* Working directory: `/app`
* Command: `/bin/sh -c "env && echo && date && echo && cat <<\EOOF > app.py && python app.py"`

## HTTP Server Details

* Server address: `http://localhost:3000`
* Exposed port: `8300`

## Notes

* To access the container, run `docker compose exec box1 bash`.
* To expose the HTTP server via a public domain name with automatic HTTPS, use `ssh -R 80:localhost:3000 serveo.net`.
# Simple Python HTTP Server with Docker Compose

This project demonstrates a simple HTTP server written in Python and deployed using Docker Compose. The server displays a "Hello, World!" message along with the current date and time.

## Project Structure

- `app.py`: Contains the Python code for the HTTP server.
- `compose.yaml`: Docker Compose configuration file for running the server in a container.

## Features

- Simple HTTP server using Python's `http.server` module.
- Displays current date and time with each request.
- Containerized using Docker for easy deployment.
- Read-only mount of the `app.py` file into the container.

## Prerequisites

- Docker
- Docker Compose

## Running the Application

1. Clone this repository to your local machine.
2. Navigate to the project directory.
3. Run the following command to start the server:

   ```
   docker-compose up
   ```

4. Open your web browser and visit `http://localhost:8300` to see the server in action.

## Configuration

- The server runs on port 3000 inside the container.
- The container's port 3000 is mapped to the host's port 8300.
- The `app.py` file is mounted as read-only into the container.

## Additional Notes

- You can access the container's shell using:
  ```
  docker-compose exec box1 bash
  ```

- The project includes commented-out instructions for exposing the local webserver via a public domain name with automatic HTTPS using serveo.net.

## Customization

To modify the server's behavior, edit the `app.py` file. Remember to restart the Docker container after making changes:

```
docker-compose down
docker-compose up --build
```

## License

This project is open-source and available under the MIT License.
