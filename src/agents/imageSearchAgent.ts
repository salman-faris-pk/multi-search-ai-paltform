import 'dotenv/config';
import { BaseMessage } from "@langchain/core/messages"
import { RunnableSequence,RunnableLambda, RunnableParallel} from "@langchain/core/runnables"
import { PromptTemplate } from "@langchain/core/prompts"
import formatChatHistoryAsString from "../utils/formatHistory.js";
import { StringOutputParser } from "@langchain/core/output_parsers"
import { searchSearxng } from "../lib/searxng.js";
import { imageSearchChainPrompt } from '../prompts/all-prompts.js';
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";



type ImageSearchChainInput ={
    chat_history:BaseMessage[];
    query:string;
};

const strParser=new StringOutputParser();

 const extractImagesFromResults = async (query: string) => {
  const res = await searchSearxng(query, {
    categories: ["images"],
    engines: ["google images", "bing images"],
  });
 
  return res.results
    .filter(result => result.img_src && result.url && result.title)
    .slice(0, 10)
    .map(({ img_src, url, title }) => ({ img_src, url, title }));
};

const createImageSearchChain =(llm:BaseChatModel)=> {
  return RunnableSequence.from([ 
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
};


export const handleImageSearch = (
  input: ImageSearchChainInput,
  llm: BaseChatModel
) => createImageSearchChain(llm).invoke(input);




export default handleImageSearch;

