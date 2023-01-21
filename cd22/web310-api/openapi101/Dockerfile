# syntax=docker/dockerfile:1.3-labs
FROM busybox:1.35.0
ARG SWAGGER_UI_VERSION="4.15.2"
RUN <<\EOOF
  cd /tmp
  wget "https://github.com/swagger-api/swagger-ui/archive/v$SWAGGER_UI_VERSION.zip"
  unzip "v$SWAGGER_UI_VERSION.zip" -d swagger-ui
  mkdir -p /opt/webroot/api-ui
  cp -r "swagger-ui/swagger-ui-$SWAGGER_UI_VERSION/dist/." /opt/webroot/api-ui/
EOOF