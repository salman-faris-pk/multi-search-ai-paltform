import http from "http"
import { WebSocketServer } from "ws"
import { handleConnection } from "./connectionManager.js"
import { getPort } from "../config.js";

export const initServer =(server:http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>)=>{
   
    const Port=getPort();
   const ws= new WebSocketServer({server})

   ws.on("connection",(ws)=>{
       handleConnection(ws)
   });

   console.log("websocket server start on",Port);
   
};