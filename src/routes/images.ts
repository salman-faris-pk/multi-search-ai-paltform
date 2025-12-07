import express from "express";
import handleImageSearch from "../agents/imageSearchAgent.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getChatModel, getChatModelProvider, getGeminaiApiKey } from "../config.js";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getAvailableProviders } from "../lib/providers.js";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

const router = express.Router();


router.post("/", async(req, res) => {
    try {
            
        let {query,chat_history}=req.body;

        chat_history = chat_history.map((msg:any) => {
           if(msg.role === "user"){
            return new HumanMessage(msg.content)
           }else if(msg.role === "assistant"){
            return new AIMessage(msg.content)
           }
        });

        const models=await getAvailableProviders();
        const provider=getChatModelProvider();
        const chatModel= getChatModel();

        let llm:BaseChatModel | undefined;

        if(models[provider] && models[provider][chatModel]) {
             llm= models[provider][chatModel]  as BaseChatModel | undefined;
        };

         if (!llm) {
           res.status(500).json({ message: "Invalid LLM model selected" });
            return;
         };

        const images=await handleImageSearch({query,chat_history: chat_history},llm);
        
        res.status(200).json({ images });

    } catch (err) {
        console.log("Error message:", err.message);
        res.status(500).json({ 
            message: "An error has occurred.",
            error: err.message 
        });
    }
});



export default router;