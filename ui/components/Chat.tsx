"use client"


import { useEffect, useRef, useState } from "react";
import { Message } from "./ChatWindow"
import MessageBoxLoading from "./MessageBoxLoading";
import MessageBox from "./MessageBox";



interface ChatProps{
  messages: Message[];
  sendMessage: (message: string) => void;
  loading: boolean;
  messageAppeared: boolean;
  rewrite: (messageId: string) => void;
};

const Chat = ({messages,sendMessage,loading,messageAppeared,rewrite}:ChatProps) => {

  const [dividerWidth, setDividerWidth] = useState(0);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() =>{
    const updateDividerWidth=()=>{
      if(dividerRef.current){
        setDividerWidth(dividerRef.current.scrollWidth)
      }
    };

    updateDividerWidth();

    window.addEventListener("resize",updateDividerWidth);

    return ()=>{
         window.removeEventListener("resize",updateDividerWidth)
    };

  });


  useEffect(()=>{
    messageEnd.current?.scrollIntoView({ behavior: "smooth"});

    if(messages.length === 1){
      document.title =`${messages[0].content.substring(0, 30)} - FutureSearch`
    }

  },[messages])

  return (
    <div className="flex flex-col space-y-6 pt-8 pb-44 lg:pb-32 sm:mx-4 md:mx-8">
        {messages.map((msg,i) => {
         
         const isLast= i === messages.length - 1;

          return (
            <>
            <MessageBox 
              key={i}
              message={msg}
              history={messages}
              isLast={isLast}
              messageIndex={i}
              sendMessage={sendMessage}
              loading={loading}
              rewrite={rewrite}
              dividerRef={isLast ? dividerRef : undefined}
            />
            </>
          )
        })}

        {loading && !messageAppeared && <MessageBoxLoading/>}



    </div>
  )
}

export default Chat