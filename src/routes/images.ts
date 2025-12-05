import express from "express";
import handleImageSearch from "../agents/imageSearchAgent.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getGeminaiApiKey } from "../config.js";

const router = express.Router();

 const llm = new ChatGoogleGenerativeAI({
  model: process.env.MODEL_NAME,
  temperature: 0,
  apiKey: getGeminaiApiKey(),
});


router.post("/", async(req, res) => {
    try {
            
        const {query,chat_history}=req.body;
          
        const images=await handleImageSearch({
            query,
            chat_history: chat_history || [],
        },llm);

        
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