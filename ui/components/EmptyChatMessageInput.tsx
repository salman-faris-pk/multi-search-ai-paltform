import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Focus } from "lucide-react"

interface ChatMEssageInputprops{
  sendMessage: (message: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
};

const EmptyChatMessageInput = ({sendMessage,focusMode,setFocusMode}:ChatMEssageInputprops) => {
  
  const [message,setMessage]=useState("");
  const [copilotEnabled,setCopilotEnables]=useState(false);

  return (
    <form className="w-full">
      <div className="flex flex-col bg-[#111111] px-5 pt-5 pb-2 rounded-lg w-full border border-[#1C1C1C]">
       <TextareaAutosize
         value={message}
         onChange={(e)=> setMessage(e.target.value)}
         minRows={2}
         placeholder="Ask anything..."
         className="bg-transparent placeholder:text-white/50 text-sm text-white resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
       />

       <div className="flex flex-row items-center justify-between mt-4">
          <div className="flex flex-row items-center space-x-1 -mx-2">
             {/*focus and attach*/}
          </div>

          <div className="flex flex-row items-center space-x-4 -mx-2">

          </div>
       </div>

      </div>
    </form>
  )
}

export default EmptyChatMessageInput