import { Message } from "@/components/ChatWindow";
import { Check, ClipboardList } from "lucide-react";
import { useState } from "react";



interface CopyContentProps{
     message: Message;
     initilaMessageContent: string;
};


const Copy = ({initilaMessageContent,message}:CopyContentProps) => {

    const [copied, setCopied] = useState(false);

  return (
    <button className="p-2 text-white/70 rounded-xl hover:bg-[#1c1c1c] transition duration-200 hover:text-white"
      onClick={()=> {
          const contentCopy= `${initilaMessageContent}${
            message.sources && 
            message.sources.length > 0 &&
            `\n\nCitations:\n${message.sources?.map((source, i) => `[${i + 1}] ${source.metadata.url}`)
            .join('\n')}`                        //Citations: 1. sun..... like this maping the data lne by line
      }`;
            navigator.clipboard.writeText(contentCopy)
            setCopied(true);

            setTimeout(()=>{
               setCopied(false)
            },1000)
         
      }}
    >
         {copied ? <Check size={18} /> : <ClipboardList size={18} />}
    </button>
  )
}

export default Copy