"use client";

import { Document } from "@langchain/core/documents";
import { useEffect, useRef, useState } from "react";
import EmptyChat from "./EmptyChat";
import Chat from "./Chat";
import Navbar from "./Navbar";
import { getSuggestions } from "@/lib/actions";

export type Message = {
  id: string;
  createdAt: Date;
  content: string;
  role: "user" | "assistant";
  suggestions?: string[];
  sources?: Document[];
};

const useSocket = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!ws) {
      const ws = new WebSocket(url);
      ws.onopen = () => {
        console.log("[DEBUG] open");
        setWs(ws);
      };
    }

    return () => {
      ws?.close();
    };
  }, [ws, url]);

  return ws;
};

const ChatWindow = () => {

  const ws = useSocket(process.env.NEXT_PUBLIC_WS_URL!);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageAppeared, setMessageAppeared] = useState(false);
  const [focusMode, setFocusMode] = useState("webSearch");


  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);


  const handleSendMessage = async (message: string) => {
    if (loading) return;

    setLoading(true);
    setMessageAppeared(false);

    let sources: Document[] | undefined = undefined;
    let receivedMessage = "";
    let added = false;
 
    ws?.send(
      JSON.stringify({
        type: "message",
        content: message,
        focusMode: focusMode,
        history: [...chatHistory, ["human", message]],
      })
    );

    setMessages((prevMessages) => [   // for optimistic ui upadte (dummy..)
      ...prevMessages,
      {
        content: message,
        id: crypto.randomUUID().replace(/-/g, '').substring(0, 10),
        role: "user",
        createdAt: new Date(),
      },
    ]);



    const messageHandler = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "sources") {
        sources = data.data;

        if (!added) {  
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: "",
              id: data.messageId,
              role: "assistant",
              sources: sources,
              createdAt: new Date(),
            },
          ]);             //Server sends "sources" only at the start.means only one time
          added = true;
        }
        setMessageAppeared(true);  
      }

      if (data.type === "message") {   // Server sends many "message" events — one per chunk of the response.
                                        // This runs repeatedly until all chunks are sent and "messageEnd" arrives.
        if (!added) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              content: data.data,
              id: data.messageId,
              role: "assistant",
              sources: sources,
              createdAt: new Date(),
            },
          ]);
          added = true;
        }
                               // Each chunk uses the same messageId, so this updates the same bubble every time.
        setMessages((prev) =>  // Finalizing!! Finding the assistant message with this messageId and append the new chunk to its content.
          prev.map((message) => {
            if (message.id === data.messageId) {
              return { ...message, content: message.content + data.data };
            }
            return message;
          })
        );

        receivedMessage += data.data;
        setMessageAppeared(true);
      }

      if (data.type === "messageEnd") {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          ["human", message],   //when message  chunks and all users query added to this state
          ["assistant", receivedMessage],  //all assistant replies too
        ]);
        
        ws?.removeEventListener("message", messageHandler);
        setLoading(false);

        const lastMsg= messagesRef.current[messagesRef.current.length - 1];
                
        if(lastMsg.role === "assistant" &&  lastMsg.sources && lastMsg.sources.length > 0 && !lastMsg.suggestions){

            const suggestions=await getSuggestions(messagesRef.current);

               setMessages((prev) => 
                   prev.map((msg) => {
                    if(msg.id === lastMsg.id){
                      return { ...msg, suggestions:suggestions}
                    }

                    return msg;
                 })
               )
        }
      }
    };

    ws?.addEventListener("message", messageHandler);
  
  };



  const regenerate= (messageId:string)=>{  
      const index= messages.findIndex((msg)=> msg.id === messageId);

      if(index === - 1) return;

      const message=messages[index - 1]; //gets the previous user message

      setMessages((prev) => {
         return [...prev.slice(0, messages.length > 2 ? index - 1 : 0)]   //it removes the selected one index AND all messages after it.if not greater than  2 then all deletes
      });

      setChatHistory((prev)=> {
        return [...prev.slice(0,messages.length > 2 ? index - 1 : 0)]
      });

      handleSendMessage(message.content)
  };

  
  return (
    <div>
      {messages.length > 0 ? (
        <>
          <Navbar messages={messages}/>
          <Chat 
            messages={messages}
            messageAppeared={messageAppeared}
            loading={loading}
            sendMessage={handleSendMessage}
            rewrite={regenerate}
          />
        </>
      ) : (
        <EmptyChat
          sendMessage={handleSendMessage}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
        />
      )}
    </div>
  );
};

export default ChatWindow;