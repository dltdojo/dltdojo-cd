FROM busybox:1.35.0 AS BUSYBOX
ARG SWAGGER_UI_VERSION="4.15.2"
RUN cd /tmp && \
  wget "https://github.com/swagger-api/swagger-ui/archive/v$SWAGGER_UI_VERSION.zip" && \
  unzip "v$SWAGGER_UI_VERSION.zip" -d swagger-ui && \
  mkdir -p /opt/webroot/api-ui && \
  cp -r "swagger-ui/swagger-ui-$SWAGGER_UI_VERSION/dist/." /opt/webroot/api-ui/


FROM denoland/deno:1.27.1 AS DENO
COPY --from=BUSYBOX /opt/webroot/api-ui/ /opt/webroot/api-ui/
ADD init.ts /tmp/init.ts
RUN deno run -A /tmp/init.ts
RUN deno install --root=/usr/local --allow-net --allow-read https://deno.land/std@0.159.0/http/file_server.ts
ADD api101.ts /tmp/api101.ts
