import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate,ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableLambda, RunnableParallel, RunnableSequence } from "@langchain/core/runnables";
import { searchSearxng } from "../lib/searxng.js";
import { Document } from "@langchain/core/documents"
import { BaseMessage } from "@langchain/core/messages";
import formatChatHistoryAsString from "../utils/formatHistory.js";
import { EventEmitter} from "events";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { basicSearchRetrieverPrompt, basicWebSearchResponsePrompt } from "../prompts/all-prompts.js";
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
      case "on_chain_end:WebSearchSourceRetriever":
        emitter.emit("data", JSON.stringify({
          type: "sources",
          data: event.data.output
        }));
        break;
      
      case "on_chain_stream:WebSearchResponseGenerator":
        emitter.emit("data", JSON.stringify({
          type: "response",
          data: event.data.chunk
        }));
        break;
      
      case "on_chain_end:WebSearchResponseGenerator":
        emitter.emit("end");
        break;
    }
  }
};

const createBasicWebSearchRetrieverChain =(llm: BaseChatModel) =>{
  return RunnableSequence.from([
    PromptTemplate.fromTemplate(basicSearchRetrieverPrompt), /// for best query from llm ,means normal query --> renavated query
    llm,
    strParser,
    RunnableLambda.from(async(input:string) => {

        if(input === 'not_needed'){   //from llm respose acording to given propmt
            return{query:"",docs: []}
        };

        const res=await searchSearxng(input, {
            language: 'en'
        });
      
        const documents= res.results.map((result) =>  new Document({
            pageContent: result.content,
            metadata: {
                title: result.title,
                url: result.url,
                ...(result.img_src && { img_src: result.img_src }),
            },
        }));

        return { query:input, docs: documents}

    }),
]);
};


const createBasicWebSearchAnsweringChain =(llm:BaseChatModel,embeddings:Embeddings) => {

  const basicWebSearchRetrieverChain = createBasicWebSearchRetrieverChain(llm);

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
              basicWebSearchRetrieverChain
               .pipe(rerankDocs)
               .pipe(processDocs)
               .withConfig({
                runName: "WebSearchSourceRetriever"
               })
        ]),
    }),
    ChatPromptTemplate.fromMessages([
      ["system", basicWebSearchResponsePrompt], //The system message, which gives the LLM its persona and instructions
      new MessagesPlaceholder("chat_history"),  //This slot is filled with the entire past conversation, so the LLM knows what was said before.
      ['user', "{query}"]                       //This slot is filled with the user's latest question.
    ]),
    llm,
    strParser,
]).withConfig({
   runName: "WebSearchResponseGenerator"
});
};



const basicWebSearch =(query:string, history: BaseMessage[],llm: BaseChatModel,embeddings: Embeddings)=>{

     const emitter= new EventEmitter();

     try{
      const basicWebSearchAnsweringChain = createBasicWebSearchAnsweringChain(llm,embeddings);
        const stream= basicWebSearchAnsweringChain.streamEvents(
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


const handleWebSearch=(
  message: string, 
  history: BaseMessage[],
  llm: BaseChatModel,
  embeddings: Embeddings
 )=>{

   const emitter=basicWebSearch(message, history,llm,embeddings);
   return emitter;
};


export default handleWebSearch;


