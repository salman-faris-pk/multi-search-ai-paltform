import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage } from "@langchain/core/messages"
import { RunnableSequence,RunnableLambda, RunnableParallel} from "@langchain/core/runnables"
import { PromptTemplate } from "@langchain/core/prompts"
import formatChatHistoryAsString from "../utils/formatHistory.js";
import { StringOutputParser } from "@langchain/core/output_parsers"
import { searchSearxng } from "../lib/searxng.js";
import { imageSearchChainPrompt } from '../prompts/all-prompts.js';


const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});



type ImageSearchChainInput ={
    chat_history:BaseMessage[];
    query:string;
};

const strParser=new StringOutputParser();


const extractImagesFromResults = async (query: string) => {
  const res = await searchSearxng(query, {
    categories: ["images"],
    engines: ["google images", "bing images", "yandex images"],
  });
 
  return res.results
    .filter(result => result.img_src && result.url && result.title)
    .slice(0, 10)
    .map(({ img_src, url, title }) => ({ img_src, url, title }));
};


const imageSearchChain = RunnableSequence.from([ 
    RunnableParallel.from({                         
        chat_history: (input:ImageSearchChainInput) => { 
            return formatChatHistoryAsString(input.chat_history);
        },
         query: (input: ImageSearchChainInput) => {
             return input.query;
         },
    }),
    PromptTemplate.fromTemplate(imageSearchChainPrompt),   
    llm,                                                    
    strParser,                                              
    RunnableLambda.from(extractImagesFromResults),
]);



export default imageSearchChain;

