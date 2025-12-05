import {basicYoutubeSearchResponsePrompt,basicYoutubeSearchRetrieverPrompt} from "../prompts/all-prompts.js"
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate,ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableLambda, RunnableParallel, RunnableSequence } from "@langchain/core/runnables";
import { searchSearxng } from "../lib/searxng.js";
import { Document } from "@langchain/core/documents"
import { BaseMessage } from "@langchain/core/messages";
import formatChatHistoryAsString from "../utils/formatHistory.js";
import { EventEmitter} from "events";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Embeddings } from "@langchain/core/embeddings";
import { processDocs, createRerankDocs } from '../utils/document-processors.js';



type BasicChainInput = {
  chat_history: BaseMessage[];
  query: string;
};

const strParser= new StringOutputParser();

const handleStream = async (
  stream: AsyncGenerator<StreamEvent, any, unknown>,
  emitter: EventEmitter
) => {
  for await (const event of stream) {
    switch (`${event.event}:${event.name}`) {
      case "on_chain_end:YoutubeSearchSourceRetriever":
        emitter.emit("data", JSON.stringify({
          type: "sources",
          data: event.data.output
        }));
        break;
      
      case "on_chain_stream:YoutubeSearchResponseGenerator":
        emitter.emit("data", JSON.stringify({
          type: "response",
          data: event.data.chunk
        }));
        break;
      
      case "on_chain_end:YoutubeSearchResponseGenerator":
        emitter.emit("end");
        break;
    }
  }
};

const createBasicYoutubeSearchRetrieverChain =(llm:BaseChatModel)=>{
   return RunnableSequence.from([
     PromptTemplate.fromTemplate(basicYoutubeSearchRetrieverPrompt),
     llm,
     strParser,
     RunnableLambda.from(async (input: string) => {
       if (input === "not_needed") {
         return { query: "", docs: [] };
       }

       const res = await searchSearxng(input, {
         language: "en",
         engines: ["youtube"],
       });

       const documents = res.results.map(
         (result) =>
           new Document({
             pageContent: result.content,
             metadata: {
               title: result.title,
               url: result.url,
               ...(result.img_src && { img_src: result.img_src }),
             },
           })
       );

       return { query: input, docs: documents };
     }),
   ]);
};


const createBasicYoutubeSearchAnsweringChain =(llm: BaseChatModel,embeddings: Embeddings) => {
    
  const basicYoutubeSearchRetrieverChain =
    createBasicYoutubeSearchRetrieverChain(llm);

  const rerankDocs=createRerankDocs(embeddings);

  return RunnableSequence.from([
    RunnableParallel.from({
        query: (input: BasicChainInput) => input.query,
        chat_history: (input: BasicChainInput) => input.chat_history,
        context: RunnableSequence.from([
            (input)=> ({
                query: input.query,
                chat_history: formatChatHistoryAsString(input.chat_history)
            }),
             basicYoutubeSearchRetrieverChain
               .pipe(rerankDocs)
               .pipe(processDocs)
               .withConfig({
                runName: "YoutubeSearchSourceRetriever"
               })
        ]),
    }),
    ChatPromptTemplate.fromMessages([
      ["system", basicYoutubeSearchResponsePrompt],
      new MessagesPlaceholder("chat_history"),
      ['user', "{query}"]      
    ]),
    llm,
    strParser,
]).withConfig({
   runName: "YoutubeSearchResponseGenerator"
});
};



const basicYoutubeSearch =(query:string, history: BaseMessage[],llm:BaseChatModel,embeddings:Embeddings)=>{

     const emitter= new EventEmitter();

     try{
      const basicYoutubeSearchAnsweringChain=createBasicYoutubeSearchAnsweringChain(llm,embeddings);

        const stream= basicYoutubeSearchAnsweringChain.streamEvents(
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



const handleYoutubeSearch=(
   message: string,
   history: BaseMessage[],
   llm:BaseChatModel,
  embeddings:Embeddings
  )=>{
    
   const emitter=basicYoutubeSearch(message, history, llm, embeddings);

   return emitter;
};


export default handleYoutubeSearch;
