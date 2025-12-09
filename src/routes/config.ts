import express from "express";
import { getAvailableProviders } from "../lib/providers.js";
import { getChatModel, getChatModelProvider, getGeminaiApiKey, getGroqApiKey, getOllamaApiEndpoint, getOpenAiApiKey, updateConfig } from "../config.js";


const router = express.Router();


router.get("/",async(_,res)=>{
     const config={};

     const providers=await getAvailableProviders();

     for(const provider in providers){
        delete providers[provider]["embeddings"]  //Remove embeddings from each provider,Because "embeddings" is not a chat model,
     };

     config["providers"]= {};

     for (const [provider, data] of Object.entries(providers)) {
         config["providers"][provider] = Object.keys(data)    //here provider means key like gemini,openai...                                                        
      };                                                       //data means gpt or gemini verisons or model names

     config["selectedProvider"]=getChatModelProvider();
     config["selectedChatModel"]=getChatModel();
     config["ollamaApiUrl"] = getOllamaApiEndpoint();
     config["geminiApiKey"] = getGeminaiApiKey();
     config["grokApiKey"]=getGroqApiKey();
     config["openAIApiKey"]=getOpenAiApiKey();

  
     res.status(200).json(config);
});


router.post("/", async (req, res) => {

    const config=req.body;

    const updatedConfigData={
      GENERAL: {
        CHAT_MODEL_PROVIDER: config.selectedProvider,
        CHAT_MODEL: config.selectedChatModel,
       },
      API_KEYS: {
        GEMINI: config.geminiApiKey,
        GROQ: config.grokApiKey,
        OPENAI: config.openAIApiKey
      },
     API_ENDPOINTS: {
       OLLAMA: config.ollamaApiUrl
    }
  };   
   
  updateConfig(updatedConfigData);

  res.status(200).json({message: "config updated"});

});


export default router;

