import { RefObject, useState } from "react";
import { Message } from "./ChatWindow";
import { cn } from "@/lib/utils";



interface MessageBoxProps{
  message: Message;
  messageIndex: number;
  history: Message[];
  loading: boolean;
  dividerRef?: RefObject<HTMLDivElement | null>;
  isLast: boolean;
  rewrite: (messageId: string) => void;
  sendMessage: (message: string) => void;
}

const MessageBox = ({
    message,
    messageIndex,
    history,
    loading,
    dividerRef,
    isLast,
    rewrite,
    sendMessage
   }:MessageBoxProps) => {

    const [parsedMessage,setParsedMessage]=useState(message.content);

  return (
    <div>
        {message.role === "user" && (
            <div className={cn("w-full", messageIndex === 0 ? "pt-16" : "pt-8")}>
                 <h2 className="text-white font-medium text-3xl lg:w-9/12">
                    {message.content}
                 </h2>
            </div>
        )}

    </div>
  )
}

export default MessageBox