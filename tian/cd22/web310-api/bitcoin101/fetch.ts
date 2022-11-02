export type JsonRpcRequest = { id: string; method: string; params: unknown[] }
export type JsonRpcResponse = { id: string; result: unknown; error: unknown }
const jsonrpc = async (url: string, v: JsonRpcRequest) : Promise<JsonRpcResponse> => {
    const data = { jsonrpc: '1.0', ...v };
    const body = JSON.stringify(data);
    const postOpt = {
        method: 'POST', body,
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }
    const result = await fetch(url, postOpt).then((res) => {
        return res.json();
    });
    return result;
}
const url = "http://foo:qDDZdeQ5vw9XXFeVnXT4PZ--tGN2xNjjR4nrtyszZx0=@localhost:18444/";
const req = {
    id: Math.floor(Math.random() * 10000).toString(),
    method: 'getbalance',
    params: ["*", 6]
}
const x = await jsonrpc(url, req);
console.log(x.result);