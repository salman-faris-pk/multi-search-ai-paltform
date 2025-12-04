import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage } from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import { EventEmitter} from "events";



const llm = new ChatGoogleGenerativeAI({
  model: process.env.MODEL_NAME,
  temperature: 0,
});



const writingAssistantPrompt = `
You are futuresearch, an AI model who is expert at searching the web and answering user's queries. You are currently set on focus mode 'Writing Assistant', this means you will be helping the user write a response to a given query. 
Since you are a writing assistant, you would not perform web searches. If you think you lack information to answer the query, you can ask the user for more information or suggest them to switch to a different focus mode.
`;

const strParser = new StringOutputParser();


const handleStream = async (
  stream: AsyncGenerator<StreamEvent, any, unknown>,
  emitter: EventEmitter
) => {
  for await (const event of stream) {
    switch (`${event.event}:${event.name}`) {
      case "on_chain_end:FinalSourceRetriever":
        emitter.emit("data", JSON.stringify({
          type: "sources",
          data: event.data.output
        }));
        break;
      
      case "on_chain_stream:FinalResponseGenerator":
        emitter.emit("data", JSON.stringify({
          type: "response",
          data: event.data.chunk
        }));
        break;
      
      case "on_chain_end:FinalResponseGenerator":
        emitter.emit("end");
        break;
    }
  }
};


const basicWritingAssistanChain= RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
        ["system", writingAssistantPrompt],   //you are a writing assistant
        new MessagesPlaceholder("chat_history"),  //insert all previous messages from the conversation
        ["user", "{query}"],    //This is the latest user input.the new user message that you want the model to respond to.
    ]),
    llm,
    strParser,
]).withConfig({
    runName: "FinalResponseGenerator",
});



const handleWritingAssistant =(query:string, history: BaseMessage[])=>{

     const emitter= new EventEmitter();

     try{
        const stream= basicWritingAssistanChain.streamEvents(
        {
          chat_history: history,
          query: query
        },{
          version: "v1"
        });


        handleStream(stream, emitter)

     }catch(err){
       emitter.emit(
        "error",
        JSON.stringify({
        data: `An error has occurred please try again later: ${err}`,
      })
       );
     }

     return emitter;
};

export default handleWritingAssistant;