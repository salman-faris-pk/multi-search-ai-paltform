import { RefObject, useState } from "react";
import { Message } from "./ChatWindow";
import { cn } from "@/lib/utils";
import { BookCopy, Disc3, Share } from "lucide-react";
import MessageSources from "./MessageSources";
import ReactMarkdown from "react-markdown";


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

      {message.role === "assistant" && (
        <div className="flex flex-col space-y-9 lg:space-y-0 lg:flex-row lg:justify-between lg:space-x-9">
          <div
            ref={dividerRef}
            className="flex flex-col space-y-6 w-full lg:w-9/12"
          >
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-2">
                  <BookCopy className="text-white" size={20} />
                  <h3 className="text-white font-medium text-xl">Sources</h3>
                </div>
                <MessageSources sources={message.sources} />
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <Disc3
                  className={cn(
                    "text-white",
                    isLast && loading ? "animate-spin" : "animate-none"
                  )}
                  size={20}
                />
                <h3 className="text-white font-medium text-xl">Answer</h3>
              </div>
              <div className="prose max-w-none wrap-break-word prose-invert prose-p:leading-relaxed prose-pre:p-0 text-white text-sm md:text-base font-medium">
                <ReactMarkdown>{parsedMessage}</ReactMarkdown>
              </div>
              
              {!loading && (
                <div className="flex flex-row items-center justify-between w-full text-white py-4 -mx-2">
                   <div className="flex flex-row items-center space-x-1">
                     <button className="p-2 text-white/70 rounded-xl hover:bg-[#1c1c1c] transition duration-200 hover:text-white">
                      <Share size={18} />
                    </button>
                      
                    </div>
                </div>
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageBox