import express from "express";
import imageRouter from "./images.js"
import configRouter from "./config.js";
import videoRouter from "./videos.js"

const router = express.Router();

router.use('/images',imageRouter)
router.use('/config',configRouter)
router.use('/videos',videoRouter)




export default router