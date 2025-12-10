import express from "express";
import imageRouter from "./images.js"
import configRouter from "./config.js";
import videoRouter from "./videos.js"
import suggestionsRouter from "./suggestions.js"


const router = express.Router();

router.use('/images',imageRouter)
router.use('/config',configRouter)
router.use('/videos',videoRouter)
router.use("/suggestions", suggestionsRouter);




export default router