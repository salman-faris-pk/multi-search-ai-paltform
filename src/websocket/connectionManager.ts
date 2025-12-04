import { WebSocket } from "ws"
import { handleMessage } from "./messageHandler.js"
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getGeminaiApiKey } from "../config.js";



export const handleConnection = async(ws:WebSocket)=>{

 const llm = new ChatGoogleGenerativeAI({
  model: process.env.MODEL_NAME,
  temperature: 0,
  apiKey: getGeminaiApiKey(),
});

// const Chatllm = new ChatGoogleGenerativeAI({
//   model: process.env.CHAT_MODEL_NAME,
//   temperature: 0.7,
//   apiKey: getGeminaiApiKey(),
// });


const embeddings = new GoogleGenerativeAIEmbeddings({
  model: process.env.EMBEDDINGS_MODEL,
  apiKey: getGeminaiApiKey()
});

    ws.on("message", async(message)=> await handleMessage(message.toString(), ws,llm,embeddings));


    ws.on("close",()=>{
        console.log("connection closes");
    });


}