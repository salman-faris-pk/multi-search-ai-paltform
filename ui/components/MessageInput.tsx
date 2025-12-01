import { useState } from "react";



interface MessageInputProps{
  sendMessage: (message: string) => void;
  loading: boolean;
};

const MessageInput = ({sendMessage,loading}:MessageInputProps) => {

     const [copilotEnabled, setCopilotEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [textareaRows, setTextareaRows] = useState(1);

  const [mode, setMode] = useState<"multi" | "single">("single");

  return (
    <div>MessageInput</div>
  )
}

export default MessageInput