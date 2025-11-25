import http from "http"
import { initServer } from "./socketServer.js";


export const startWebSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  initServer(server);
};