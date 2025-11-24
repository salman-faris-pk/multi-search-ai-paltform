import express from "express";
import imageSearchChain from "../agents/imageSearchAgent.js";

const router = express.Router();

router.post("/", async(req, res) => {
    try {
            
        const {query,chat_history}=req.body;
          
        const images=await imageSearchChain.invoke({
            query,
            chat_history: chat_history || [],
        });

        
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