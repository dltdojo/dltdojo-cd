type JsonRpcRequest = { id: string, method: string, params: unknown[] }
async function jsonrpc1(url: string, v: JsonRpcRequest) {
    const data = { jsonrpc: '1.0', ...v };
    const body = JSON.stringify(data);
    const postOpt = {
        method: 'POST', body,
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }
    const jsonResponse = await fetch(url, postOpt);
    return await jsonResponse.json();
}
const url = "http://foo:qDDZdeQ5vw9XXFeVnXT4PZ--tGN2xNjjR4nrtyszZx0=@localhost:18444/";
const req = {
    id: Math.floor(Math.random() * 10000).toString(),
    method: 'getbalance',
    params: ["*", 6]
}
const result = await jsonrpc1(url, req);
console.log(result);