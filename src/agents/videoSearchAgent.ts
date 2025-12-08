import { BaseMessage } from "@langchain/core/messages"
import { RunnableSequence,RunnableLambda, RunnableParallel} from "@langchain/core/runnables"
import { PromptTemplate } from "@langchain/core/prompts"
import formatChatHistoryAsString from "../utils/formatHistory.js";
import { StringOutputParser } from "@langchain/core/output_parsers"
import { searchSearxng } from "../lib/searxng.js";
import { VideoSearchChainPrompt } from '../prompts/all-prompts.js';
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";


type VideoSearchChainInput = {
  chat_history: BaseMessage[];
  query: string;
};

const strParser = new StringOutputParser();


const extractVideosFromResults = async (query: string) => {
     
    const res = await searchSearxng(query, {
      engines: ["youtube"],
    });

    return res.results
         .filter(result => result.thumbnail && result.url && result.title && result.iframe_src)
         .slice(0, 10)
         .map((result) => ({
            img_src: result.thumbnail,
            url: result.url,
            title: result.title,
            iframe_src: result.iframe_src
         }));
};


const createVideoSearchChain=(llm: BaseChatModel)=>{
    return RunnableSequence.from([
        RunnableParallel.from({
          chat_history: (input: VideoSearchChainInput) =>{
            return formatChatHistoryAsString(input.chat_history);
          },
          query: (input:VideoSearchChainInput) => {
             return input.query;
          }
        }),
        PromptTemplate.fromTemplate(VideoSearchChainPrompt),
        llm,
        strParser,
        RunnableLambda.from(extractVideosFromResults)
    ]);
};


const handleVideoSearch =(
    input: VideoSearchChainInput,
    llm: BaseChatModel
) =>{
   const VideoSearchChain=createVideoSearchChain(llm);
   return VideoSearchChain.invoke(input)
};


export default handleVideoSearch;