import express from "express";
import imageRouter from "./images.js"
import configRouter from "./config.js";

const router = express.Router();

router.use('/images',imageRouter)
router.use('/config',configRouter)



export default router