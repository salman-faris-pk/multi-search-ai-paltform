import express from "express";
import { getChatModel, getChatModelProvider } from "../config.js";
import { getAvailableProviders } from "../lib/providers.js";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import generateSuggestions from "../agents/suggestionGenerator.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    
    let { chat_history} = req.body;

    chat_history = chat_history
      .map((msg: any) => {
        if (msg && msg.role === "user") {
          return new HumanMessage({
            content: msg.content || "",
          });
        } else if (msg && msg.role === "assistant") {
          return new AIMessage({
            content: msg.content || "",
          });
        }
        return null;
      })
      .filter(Boolean); 


    if (!chat_history || chat_history.length === 0) {
      return res.status(400).json({ 
        message: "No valid messages in chat_history" 
      });
    }

    const models = await getAvailableProviders();
    const provider = getChatModelProvider();
    const chatModel = getChatModel();

    let llm: BaseChatModel | undefined;

    if (models[provider] && models[provider][chatModel]) {
      llm = models[provider][chatModel] as BaseChatModel | undefined;
    }

    if (!llm) {
      res.status(500).json({ message: "Invalid LLM model selected" });
      return;
    }

    const suggestions = await generateSuggestions({ chat_history }, llm);

    res.status(200).json({ suggestions });

  } catch (err) {
    res.status(500).json({ message: `An error has occurred. : ${err.message}` });
     console.error('Full error:', err);
     console.error('Error stack:', err?.stack);
  }
});




export default router;