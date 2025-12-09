import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import {
  getGeminaiApiKey,
  getGroqApiKey,
  getOllamaApiEndpoint,
  getOpenAiApiKey,
} from "../config.js";
import { OllamaEmbeddings, ChatOllama } from "@langchain/ollama";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

export const getAvailableProviders = async () => {


  const geminaiApikey = getGeminaiApiKey();
  const ollamaEndpoint = getOllamaApiEndpoint();
  const groqApiKey = getGroqApiKey();
  const openAIApiKey = getOpenAiApiKey();

  const models = {};

  if (geminaiApikey) {
    try {
      models["gemini"] = {
        "Gemini-1.5-flash": new ChatGoogleGenerativeAI({
          apiKey: geminaiApikey,
          model: "gemini-1.5-flash",
          temperature: 0.7,
          maxRetries: 2,
        }),

        "Gemini-1.5-flash-latest": new ChatGoogleGenerativeAI({
          apiKey: geminaiApikey,
          model: "gemini-1.5-flash-latest",
          temperature: 0.7,
          maxRetries: 2,
        }),
        "Gemini-2.0-flash-lite": new ChatGoogleGenerativeAI({
          apiKey: geminaiApikey,
          model: "gemini-2.0-flash-lite",
          temperature: 0.7,
          maxRetries: 2,
        }),
        "Gemini-2.0-flash": new ChatGoogleGenerativeAI({
          apiKey: geminaiApikey,
          model: "gemini-2.0-flash",
          temperature: 0.7,
          maxRetries: 2,
        }),
        "Gemini-2.5-flash": new ChatGoogleGenerativeAI({
          apiKey: geminaiApikey,
          model: "gemini-2.5-flash",
          temperature: 0.7,
          maxRetries: 2,
        }),
        "Gemini-2.5-flash-lite": new ChatGoogleGenerativeAI({
          apiKey: geminaiApikey,
          model: "gemini-2.5-flash-lite",
          temperature: 0.7,
          maxRetries: 2,
        }),
        "Gemini-gemma": new ChatGoogleGenerativeAI({
          apiKey: geminaiApikey,
          model: "gemma-2-9b-it",
          temperature: 0.7,
          maxRetries: 2,
        }),
        embeddings: new GoogleGenerativeAIEmbeddings({
          apiKey: geminaiApikey,
          modelName: "gemini-embedding-001",
          maxRetries: 2,
        }),
      };
    } catch (error) {
      console.log(`Error loading GeminAI models: ${error}`);
    }
  }

  if (ollamaEndpoint) {
    try {
      const response = await fetch(`${ollamaEndpoint}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}`);
      }

      const { models: ollamaModels } = (await response.json()) as any;

      models["ollama"] = ollamaModels.reduce((acc, model) => {
        // Reduce the array of Ollama models into an object like:
        acc[model.model] = new ChatOllama({
          // { "modelName": ChatOllamaInstance }
          baseUrl: ollamaEndpoint, //This lets us dynamically support every installed Ollama model.
          model: model.model,
          temperature: 0.7,
          maxRetries: 2,
        });

        return acc;
      }, {});

      if (Object.keys(models["ollama"]).length > 0) {
        //then create an OllamaEmbeddings client using the first model in the list.
        models["ollama"]["embeddings"] = new OllamaEmbeddings({
          baseUrl: ollamaEndpoint,
          model: models["ollama"][Object.keys(models["ollama"])[0]].model, //then create an OllamaEmbeddings client using the first model in the list.
        });
      }
    } catch (error) {
      console.log(`Error loading Ollama models: ${error}`);
    }
  }

  if (groqApiKey) {
    try {
      models["groq"] = {
        "Llama 3 (free)": new ChatOpenAI({
          openAIApiKey: groqApiKey,
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          maxRetries: 2,
          configuration: {
            baseURL: "https://api.groq.com/openai/v1",
          },
        }),
        "Llama 3 70A (free)": new ChatOpenAI({
          openAIApiKey: groqApiKey,
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          maxRetries: 2,
          configuration: {
            baseURL: "https://api.groq.com/openai/v1",
          },
        }),
        "LLAMA3 8b (paid)": new ChatOpenAI({
          openAIApiKey: groqApiKey,
          modelName: "llama3-8b-8192",
          temperature: 0.7,
          maxRetries: 2,
          configuration: {
            baseURL: "https://api.groq.com/openai/v1",
          },
        }),
        "LLAMA3 70b (paid)": new ChatOpenAI({
          openAIApiKey: groqApiKey,
          modelName: "llama3-70b-8192",
          temperature: 0.7,
          maxRetries: 2,
          configuration: {
            baseURL: "https://api.groq.com/openai/v1",
          },
        }),
        "Gemma 7b (paid)": new ChatOpenAI({
          openAIApiKey: groqApiKey,
          modelName: "gemma-7b-it",
          temperature: 0.7,
          maxRetries: 2,
          configuration: {
            baseURL: "https://api.groq.com/openai/v1",
          },
        }),
        embeddings: new GoogleGenerativeAIEmbeddings({
          apiKey: geminaiApikey,
          modelName: "gemini-embedding-001",
          maxRetries: 2,
        }),
      };
    } catch (error) {
      console.log(`Error loading Ollama models: ${error}`);
    }
  }

  if (openAIApiKey) {
    try {
      models["openai"] = {
        "GPT-3.5-turbo (paid)": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-3.5-turbo",
          temperature: 0.7,
        }),
        "GPT-4 (paid)": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-4",
          temperature: 0.7,
        }),
        "GPT-4-turbo (paid)": new ChatOpenAI({
          openAIApiKey,
          modelName: "gpt-4-turbo",
          temperature: 0.7,
        }),
        embeddings: new OpenAIEmbeddings({
          openAIApiKey,
          modelName: "text-embedding-3-large",
        }),
      };
    } catch (err) {
      console.log(`Error loading OpenAI models: ${err}`);
    }
  }

  return models;
};
