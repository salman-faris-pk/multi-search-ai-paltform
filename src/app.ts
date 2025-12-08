import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import http from 'http'
import cors from "cors"
import routes from "./routes/index.js"
import { startWebSocketServer } from "./websocket/index.js";
import { getPort } from "./config.js"


const PORT= getPort();

const app = express();
const server=http.createServer(app);


app.use(express.json());

const corsOptions={
  origin:"*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions))

app.use("/api",routes)

app.get("/api", (_, res) => {
  res.status(200).json({ status: "ok"});
});


server.listen(PORT, () => console.log("Server running on port",PORT));
 
startWebSocketServer(server);
