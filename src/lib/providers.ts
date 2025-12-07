import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getGeminaiApiKey,getOllamaApiEndpoint} from "../config.js"
import { OllamaEmbeddings,ChatOllama } from "@langchain/ollama";


export const getAvailableProviders = async() => {

    const geminaiApikey= getGeminaiApiKey();
    const ollamaEndpoint= getOllamaApiEndpoint();

    const models ={};

    if(geminaiApikey){
        try {
            models["gemini"] = {
              "gemini-2.0-flash-lite": new ChatGoogleGenerativeAI({
                apiKey: geminaiApikey,
                model: "gemini-2.0-flash-lite",
                temperature: 0.7,
              }),
              "gemini-2.0-flash": new ChatGoogleGenerativeAI({
                apiKey: geminaiApikey,
                model: "gemini-2.0-flash",
                temperature: 0.7,
              }),
              "gemini-2.5-flash": new ChatGoogleGenerativeAI({
                apiKey: geminaiApikey,
                model: "gemini-2.5-flash",
                temperature: 0.7,
              }),
              "gemini-2.5-flash-lite": new ChatGoogleGenerativeAI({
                apiKey: geminaiApikey,
                model: "gemini-2.5-flash-lite",
                temperature: 0.7,
              }),
              "embeddings": new GoogleGenerativeAIEmbeddings({
                apiKey: geminaiApikey,
                modelName: "gemini-embedding-001"
              })
            };
        } catch (error) {
            console.log(`Error loading GeminAI models: ${error}`);
        }
    }


    if(ollamaEndpoint){
        try {
            const response=await fetch(`${ollamaEndpoint}/api/tags`);
            if (!response.ok) {
            throw new Error(`Ollama API returned ${response.status}`);
            }


            const { models: ollamaModels}= (await response.json()) as any

            models["ollama"]= ollamaModels.reduce((acc, model) => {   // Reduce the array of Ollama models into an object like:
                acc[model.model] = new ChatOllama({                   // { "modelName": ChatOllamaInstance }
                    baseUrl: ollamaEndpoint,                          //This lets us dynamically support every installed Ollama model.
                    model: model.model,
                    temperature: 0.7
                });

                return acc;
            },{});

            if(Object.keys(models["ollama"]).length > 0 ){          //then create an OllamaEmbeddings client using the first model in the list.
                models["ollama"]["embeddings"]= new OllamaEmbeddings({ 
                    baseUrl: ollamaEndpoint,                              
                    model: models["ollama"][Object.keys(models["ollama"])[0]].model, //then create an OllamaEmbeddings client using the first model in the list.
                });
            }

            
        } catch (error) {
            console.log(`Error loading Ollama models: ${error}`);
        }
    }

    return models;

};


