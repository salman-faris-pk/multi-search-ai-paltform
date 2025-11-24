import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import http from 'http'
import cors from "cors"
import routes from "./routes/index.js"


const app = express();
const server=http.createServer(app);

app.use(express.json());

const corsOptions={
  origin:"*"
};
app.use(cors(corsOptions))

app.use("/api",routes)

app.get("/api", (_, res) => {
  res.status(200).json({ status: "ok"});
});


server.listen(process.env.PORT, () => console.log("Server running on port",process.env.PORT));
 