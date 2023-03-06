import "https://deno.land/std@0.178.0/dotenv/load.ts";
import { Configuration, OpenAIApi } from "npm:openai@3.2.1";

const configuration = new Configuration({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
});
const openai = new OpenAIApi(configuration);

const content =
    "身為一個初學者，從哪裡開始學習 kubernetes 最佳？";
console.log(content);

const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content }],
});

const result = response.data.choices[0].message?.content
if (result) {
    console.log(result)
    Deno.writeTextFileSync(`${response.data.id}.txt`, result)
    const jsonResult = JSON.stringify(response.data, null, 2)
    console.log(jsonResult)
    Deno.writeTextFileSync(`${response.data.id}.json`, jsonResult)
}