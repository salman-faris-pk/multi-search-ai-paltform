import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { WebSocket } from "ws";
import handleWebSearch from "../agents/webSearchAgent.js";
import handleYoutubeSearch from "../agents/youtubeSearchAgent.js";
import { EventEmitter } from "stream";
import handleWritingAssistant from "../agents/writingAssistant.js";

type Message = {
  type: string;
  content: string;
  copilot: string;
  focusMode: string;
  history: Array<[string, string]>;
};

const searchHandlers = {
  webSearch: handleWebSearch,
  youtubeSearch: handleYoutubeSearch,
   writingAssistant: handleWritingAssistant,
};

const handleEmitterEvents = (
  emitter: EventEmitter,
  ws: WebSocket,
  id: string
) => {
  emitter.on("data", (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.type === "response") {
      ws.send(
        JSON.stringify({
          type: "message",
          data: parsedData.data,
          messageId: id,
        })
      );
    } else if (parsedData.type === "sources") {
      ws.send(
        JSON.stringify({
          type: "sources",
          data: parsedData.data,
          messageId: id,
        })
      );
    }
  });

  emitter.on("end", () => {
    ws.send(JSON.stringify({ type: "messageEnd", messageId: id }));
  });
  emitter.on("error", (data) => {
    const parsedData = JSON.parse(data);
    ws.send(JSON.stringify({ type: "error", data: parsedData.data }));
  });
};



export const handleMessage = async (message: string, ws: WebSocket) => {
  try {
    const parsedMessage = JSON.parse(message) as Message;
    const id = crypto.randomUUID().replace(/-/g, "").substring(0, 10);

    if (!parsedMessage.content) {
      return ws.send(
        JSON.stringify({ type: "error", data: "Invalid message format" })
      );
    }

    const history: BaseMessage[] = parsedMessage.history.map((msg) => {
      if (msg[0] === "human") {
        return new HumanMessage({
          content: msg[1],
        });
      } else {
        return new AIMessage({
          content: msg[1],
        });
      }
    });

    if (parsedMessage.type === "message") {
      const handler = searchHandlers[parsedMessage.focusMode];
      if (handler) {
        const emitter = handler(parsedMessage.content, history);

        handleEmitterEvents(emitter, ws, id);
      } else {
        ws.send(JSON.stringify({ type: "error", data: "Invalid focus mode" }));
      }
    }
  } catch (error) {
    console.error("Failed to handle message", error);
    ws.send(JSON.stringify({ type: "error", data: "Invalid message format" }));
  }
};
