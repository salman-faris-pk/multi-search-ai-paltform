"use client"


import { Message } from "./ChatWindow"




interface ChatProps{
  messages: Message[];
  sendMessage: (message: string) => void;
  loading: boolean;
  messageAppeared: boolean;
  // rewrite: (messageId: string) => void;
};

const Chat = ({messages,sendMessage,loading,messageAppeared}:ChatProps) => {


  return (
    <div>


    </div>
  )
}

export default Chat