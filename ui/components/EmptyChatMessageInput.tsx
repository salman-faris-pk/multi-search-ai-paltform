import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Attach, CopilotToggle, Focus } from "./MessageInputActions";
import { ArrowRight } from "lucide-react";

interface ChatMEssageInputprops {
  sendMessage: (message: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
}

const EmptyChatMessageInput = ({ sendMessage,focusMode,setFocusMode}: ChatMEssageInputprops) => {
  const [message, setMessage] = useState("");
  const [copilotEnabled, setCopilotEnables] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!message.trim()) return;
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col bg-[#111111] px-5 pt-5 pb-2 rounded-lg w-full border border-[#1C1C1C]">
        <TextareaAutosize
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          minRows={2}
          placeholder="Ask anything..."
          className="bg-transparent placeholder:text-white/50 text-sm text-white custom-scroll resize-none focus:outline-none w-full max-h-24 lg:max-h-36 xl:max-h-48"
        />

        <div className="flex flex-row items-center justify-between mt-4">
          <div className="flex flex-row items-center space-x-1 -mx-2">
            <Focus />
            <Attach />
          </div>

          <div className="flex flex-row items-center space-x-4 -mx-2">
            <CopilotToggle
              copilotEnabled={copilotEnabled}
              setCopilotEnabled={setCopilotEnables}
            />
            <button
              disabled={message.trim().length === 0}
              className="bg-[#24A0ED] text-white disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#ececec21] rounded-full p-2"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EmptyChatMessageInput;
