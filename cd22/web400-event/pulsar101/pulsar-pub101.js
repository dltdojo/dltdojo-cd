import { encode } from "https://deno.land/std/encoding/base64.ts"
const topic = "ws://localhost:8080/ws/v2/producer/persistent/public/default/my-topic";
const websocket = new WebSocket(topic);
var message = {
    "payload" : encode("Hello World"),
    "properties": {
      "key1" : "value1",
      "count" : 0
    },
    "context" : "1"
};

websocket.onopen = () => {
    setInterval(() => {
        message.properties.count++;
        message.payload = encode(`HelloMessage ${message.properties.count}`);
        websocket.send(JSON.stringify(message));
    }, 2000)
}

websocket.onmessage = (message) => {
    console.log(message.data);
};