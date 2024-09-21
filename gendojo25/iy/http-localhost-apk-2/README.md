# Busybox HTTP Server with SSH Tunneling

This project demonstrates a simple web server setup using Docker Compose, featuring a Busybox HTTP server and an Alpine-based container for SSH tunneling.

## Project Structure

The project consists of two main components:

1. **Busybox HTTP Server (box1)**
2. **Alpine-based SSH Tunnel Container (box2)**

### Busybox HTTP Server (box1)

This service uses the `busybox:1.36.1` image to run a simple HTTP server. Here's how it works:

- **Image**: `busybox:1.36.1`
- **Port**: Exposes port 3000 internally, mapped to port 8300 on the host
- **Command**: Runs the Busybox HTTP server with the following options:
  ```
  busybox httpd -f -v -p 3000 -h /www
  ```
  - `-f`: Run in foreground
  - `-v`: Verbose mode
  - `-p 3000`: Listen on port 3000
  - `-h /www`: Set the home directory to /www
- **Volume**: Mounts the local `index.html` file to `/www/index.html` in the container (read-only)

The `index.html` file is served by the Busybox HTTP server. You can access the web page by navigating to `http://localhost:8300` in your web browser.

### Alpine-based SSH Tunnel Container (box2)

This service uses the `alpine:3.20.3` image and is set up for SSH tunneling:

- **Image**: `alpine:3.20.3`
- **Purpose**: Provides an environment for SSH tunneling to expose the Busybox HTTP server to the internet

To use the SSH tunneling feature:

1. Access the Alpine container: `docker compose exec box2 sh`
2. Install OpenSSH client: `apk add openssh-client`
3. Set up the SSH tunnel: `ssh -R 80:box1:3000 serveo.net`

This will expose your local web server to the internet through a public URL provided by serveo.net.

## Running the Project

To start the project, use the following command in the project directory:

```
docker compose up
```

This will start both the Busybox HTTP server and the Alpine container.

## Explanation of `ssh -R 80:box1:3000 serveo.net`

The command `ssh -R 80:box1:3000 serveo.net` is used to set up a reverse SSH tunnel, exposing a local web server to the internet. Here's a breakdown of what this command does:

1. `ssh`: This is the SSH client command.
2. `-R 80:box1:3000`: This option sets up a reverse tunnel:
   - `80`: The port on the remote server (serveo.net) that will be used to access your local service.
   - `box1`: The name of the Docker container running your local web server.
   - `3000`: The port on which your local web server is running inside the 'box1' container.
3. `serveo.net`: This is the remote server that provides the tunneling service.

When you run this command, it establishes an SSH connection to serveo.net and tells it to listen on port 80. Any traffic that comes to serveo.net on port 80 will be forwarded through the SSH tunnel to your local 'box1' container on port 3000.

This setup allows you to expose your local web server (running in the 'box1' container) to the internet through serveo.net's public IP address and domain, without needing to configure port forwarding on your router or having a public IP address. It's particularly useful for temporary access, demos, or testing purposes.

Remember to install the OpenSSH client in your container before using this command, as shown in the compose.yaml file comments.

## Why Official Docker Images Usually Lack SSH Client

Official Docker images from Docker Hub prioritize minimalism, security, and size optimization. This means they often exclude tools like the SSH client, which aren't essential for core Docker functionality. 

Here's a breakdown:

* **Minimalism:** Docker images aim to include only the bare minimum components required for their specific purpose. The SSH client isn't a core requirement for running most applications.
* **Security:**  Including unnecessary tools broadens the attack surface. If a vulnerability is exploited, attackers gain access to more tools within the container.
* **Size Optimization:** Adding tools like SSH increases image size, leading to slower downloads and higher storage needs.

## Using SSH in Official Docker Images Without Building a New Image

While many official images don't include SSH client, some do.  You might need SSH access within a container without the option of creating a custom Dockerfile (e.g., due to restrictions on building images). If you need SSH functionality and can't rebuild the image, you need to choose an image that already includes it.

**Here's a corrected list of Docker images, indicating whether they include the OpenSSH client:**

| Image                                | OpenSSH Client |
|---------------------------------------|-----------------|
| busybox                               | X              |
| debian                               | X              |
| ubuntu                               | X              |
| alpine                               | X              |
| node:22.9                            | **O**            |
| node:22.9-slim                       | X              |
| node:alpine                           | X              |
| python:3-bookworm                     | **O**            |
| python:3-alpine                      | X              |
| httpd:2.4                             | X              |
| gcc:14                               | **O**            |
| bitnami/git:2.46.1                    | **O**            |
| bitnami/minideb:bullseye              | X              |
| bitnami/kubectl:1.30.5                | X              |
| bitnami/gitea:1.22.2                  | X              |
| dockette/ssh                          | **O**            |
| paulgoio/toolkit:production          | **O**            |


**Note:** This list is not exhaustive and the availability of SSH within an image can change over time. It's always recommended to check the image documentation or inspect the image contents to confirm the presence of specific tools. 

If your chosen image lacks SSH and you're unable to build a custom image, consider alternative approaches like using `docker exec` to run commands within the container or mounting volumes to transfer files.
