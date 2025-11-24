import { BaseMessage } from "@langchain/core/messages"


const formatChatHistoryAsString = (history: BaseMessage[]) => {  //here each message with its type (human/ai/system) and then the content
  return history
    .map((message) => `${message.type}: ${message.content}`)
    .join("\n");
};

export default formatChatHistoryAsString;
