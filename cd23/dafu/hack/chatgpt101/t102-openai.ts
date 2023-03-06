import "https://deno.land/std@0.178.0/dotenv/load.ts";
import { Configuration, OpenAIApi } from "npm:openai@3.2.1";

class Foo {
    #configuration;
    #openai;
    constructor() {
        this.#configuration = new Configuration({
            apiKey: Deno.env.get('OPENAI_API_KEY'),
        });
        this.#openai = new OpenAIApi(this.#configuration);
    }

    
    async typescriptExplain(prompt: string){
        const response = await this.#openai.createCompletion({
            model: "code-davinci-002",
            prompt: `${prompt}\n\n"""\nHere's what the above TypeScript is doing:\n1.`,
            temperature: 0,
            max_tokens: 128,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            stop: ["\"\"\""],
        });
        const id = response.data.id
        const result = response.data.choices[0].text
        if (result && id) {
            Deno.writeTextFileSync(`${id}.prompt.txt`, prompt)
            console.log(result)
            Deno.writeTextFileSync(`${id}.txt`, result)
            const jsonResult = JSON.stringify(response.data, null, 2)
            console.log(jsonResult)
            Deno.writeTextFileSync(`${id}.json`, jsonResult)
        }
    }


    async chat(prompt: string) {
        const response = await this.#openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });
        const id = response.data.id
        const result = response.data.choices[0].message?.content
        if (result && id) {
            Deno.writeTextFileSync(`${id}.prompt.txt`, prompt)
            console.log(result)
            Deno.writeTextFileSync(`${id}.txt`, result)
            const jsonResult = JSON.stringify(response.data, null, 2)
            console.log(jsonResult)
            Deno.writeTextFileSync(`${id}.json`, jsonResult)
        }
    }

    async correctGrammar(input: string) {
        await this.chat(`correct my grammar in the following text and explain your correction:\n${input}`)
    }

    async learnSomething(input: string, isTw = false) {
        const prompt = isTw
            ? `身為一個初學者，如何開始學習 ${input} 最好？`
            : `As a beginner, how to start learning "${input}" best`;
        await this.chat(prompt)
    }

    async gptSummarize(
        input: string,
        isTw = false
    ) {
        const prompt = isTw
            ? `用200個字概括以下主題，並將其翻譯成正體中文廣播稿。\n${input}`
            : `Summarize into 200 words podcast transcription:\n${input}`;
        await this.chat(prompt)
    }
}

const ExampleTypeScriptCode = `
class Person {
    #name: string;
    public constructor(name: string) {
      this.#name = name;
    }
    public getName(): string {
      return this.name;
    }
  }
const person = new Person("Jane");
console.log(person.getName());
`

// https://kubernetes.io/blog/2023/02/06/k8s-gcr-io-freeze-announcement/
const KubernetesBlogExamle = `
k8s.gcr.io Image Registry Will Be Frozen From the 3rd of April 2023
Monday, February 06, 2023

Authors: Mahamed Ali (Rackspace Technology)

The Kubernetes project runs a community-owned image registry called registry.k8s.io to host its container images. On the 3rd of April 2023, the old registry k8s.gcr.io will be frozen and no further images for Kubernetes and related subprojects will be pushed to the old registry.

This registry registry.k8s.io replaced the old one and has been generally available for several months. We have published a blog post about its benefits to the community and the Kubernetes project. This post also announced that future versions of Kubernetes will not be available in the old registry. Now that time has come.

What does this change mean for contributors:

    If you are a maintainer of a subproject, you will need to update your manifests and Helm charts to use the new registry.

What does this change mean for end users:

    1.27 Kubernetes release will not be published to the old registry.
    Patch releases for 1.24, 1.25, and 1.26 will no longer be published to the old registry from April. Please read the timelines below for details of the final patch releases in the old registry.
    Starting in 1.25, the default image registry has been set to registry.k8s.io. This value is overridable in kubeadm and kubelet but setting it to k8s.gcr.io will fail for new releases after April as they won’t be present in the old registry.
    If you want to increase the reliability of your cluster and remove dependency on the community-owned registry or you are running Kubernetes in networks where external traffic is restricted, you should consider hosting local image registry mirrors. Some cloud vendors may offer hosted solutions for this.

Timeline of the changes

    k8s.gcr.io will be frozen on the 3rd of April 2023
    1.27 is expected to be released on the 12th of April 2023
    The last 1.23 release on k8s.gcr.io will be 1.23.18 (1.23 goes end-of-life before the freeze)
    The last 1.24 release on k8s.gcr.io will be 1.24.12
    The last 1.25 release on k8s.gcr.io will be 1.25.8
    The last 1.26 release on k8s.gcr.io will be 1.26.3

What's next

Please make sure your cluster does not have dependencies on old image registry. For example, you can run this command to list the images used by pods:

kubectl get pods --all-namespaces -o jsonpath="{.items[*].spec.containers[*].image}" |\
tr -s '[[:space:]]' '\n' |\
sort |\
uniq -c

There may be other dependencies on the old image registry. Make sure you review any potential dependencies to keep your cluster healthy and up to date.
Acknowledgments

Change is hard, and evolving our image-serving platform is needed to ensure a sustainable future for the project. We strive to make things better for everyone using Kubernetes. Many contributors from all corners of our community have been working long and hard to ensure we are making the best decisions possible, executing plans, and doing our best to communicate those plans.
`

const foo = new Foo()
// await foo.learnSomething('kubernetes', true)
// await foo.correctGrammar("yesterday i go to a petshop in Taipei city")
// await foo.gptSummarize(KubernetesBlogExamle,true)
await foo.typescriptExplain(ExampleTypeScriptCode)