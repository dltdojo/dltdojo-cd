import { decode } from "https://deno.land/std/encoding/base64.ts"
const topic = "ws://localhost:8080/ws/v2/consumer/persistent/public/default/my-topic/my-sub";
const websocket = new WebSocket(topic);

websocket.onmessage = (message) => {
    let receiveMsg = JSON.parse(message.data);
    console.log(receiveMsg);
    let payload = new TextDecoder().decode(decode(receiveMsg.payload));
    console.log(`payload = ${payload}`);
    var ackMsg = {"messageId" : receiveMsg.messageId};
    websocket.send(JSON.stringify(ackMsg));
};