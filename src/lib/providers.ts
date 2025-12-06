import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getGeminaiApiKey,getOllamaApiEndpoint} from "../config.js"




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

            const { models: ollamaModels}=await response.json();
            
            
        } catch (error) {
            console.log(`Error loading Ollama models: ${error}`);
        }
    }

};