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
