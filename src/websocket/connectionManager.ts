import { WebSocket } from "ws"
import { handleMessage } from "./messageHandler.js"
import { getGeminaiApiKey } from "../config.js";
import { getAvailableProviders } from "../lib/providers.js";



export const handleConnection = async(ws:WebSocket)=>{

   const models=await getAvailableProviders();
   


    ws.on("message", async(message)=> await handleMessage(message.toString(), ws,llm,embeddings));


    ws.on("close",()=>{
        console.log("connection closes");
    });


}