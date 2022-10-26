# TODOs

- Using WebSockets with Deno - LogRocket Blog https://blog.logrocket.com/using-websockets-with-deno/
- Pulsar WebSocket API | Apache Pulsar https://pulsar.apache.org/docs/client-libraries-websocket/#producer-endpoint


```sh
docker pull apachepulsar/pulsar:2.10.2
docker run -it -p 6650:6650 -p 8080:8080 apachepulsar/pulsar:2.10.2 bin/pulsar standalone

docker compose -f - up --force-recreate --remove-orphans <<\EOF
services:
  pulsar101:
    image: apachepulsar/pulsar:2.10.2
    command: 
      - bin/pulsar
      - standalone
  wspub:
    image: docker.io/denoland/deno:1.26.2
    entrypoint: sh
    command:
      - -c
      - |
        sleep 20
        deno run --allow-net - <<\EOOF
        import { encode } from "https://deno.land/std/encoding/base64.ts"
        const topic = "ws://pulsar101:8080/ws/v2/producer/persistent/public/default/my-topic";
        const websocket = new WebSocket(topic);
        var message = { "payload" : encode("Hello World"),
          "properties": { "key1" : "value1", "count" : 0 },
          "context" : "1"
        };
        websocket.onopen = () => {
          setInterval(() => {
            message.properties.count++;
            message.payload = encode(`HelloMessage $${message.properties.count}`);
            websocket.send(JSON.stringify(message));
          }, 5000)
        }
        websocket.onmessage = (message) => {
          console.log(message.data);
        };
        EOOF
  wssub:
    image: docker.io/denoland/deno:1.26.2
    entrypoint: sh
    command:
      - -c
      - |
        sleep 25
        deno run --allow-net - <<\EOOF
        import { decode } from "https://deno.land/std/encoding/base64.ts"
        const topic = "ws://pulsar101:8080/ws/v2/consumer/persistent/public/default/my-topic/my-sub";
        const websocket = new WebSocket(topic);
        websocket.onmessage = (message) => {
          let receiveMsg = JSON.parse(message.data);
          console.log(receiveMsg);
          let payload = new TextDecoder().decode(decode(receiveMsg.payload));
          console.log(`payload = $${payload}`);
          var ackMsg = {"messageId" : receiveMsg.messageId};
          websocket.send(JSON.stringify(ackMsg));
        };
        EOOF
EOF
```
