import {basicAcademicSearchRetrieverPrompt,basicAcademicSearchResponsePrompt} from "../prompts/all-prompts.js"
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate,ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableLambda, RunnableParallel, RunnableSequence } from "@langchain/core/runnables";
import { searchSearxng } from "../lib/searxng.js";
import { Document } from "@langchain/core/documents"
import { BaseMessage } from "@langchain/core/messages"
import formatChatHistoryAsString from "../utils/formatHistory.js";
import { EventEmitter} from "events";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Embeddings } from "@langchain/core/embeddings";
import computeSimilarity from "../utils/computeSimilarity.js";



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
      case "on_chain_end:AcademicSourceRetrieval":
        emitter.emit("data", JSON.stringify({
          type: "sources",
          data: event.data.output
        }));
        break;
      
      case "on_chain_stream:AcademicResponseGenerator":
        emitter.emit("data", JSON.stringify({
          type: "response",
          data: event.data.chunk
        }));
        break;
      
      case "on_chain_end:AcademicResponseGenerator":
        emitter.emit("end");
        break;
    }
  }
};


const createBasicAcademicSearchRetrieverChain= (llm: BaseChatModel) => {
  return RunnableSequence.from([
    PromptTemplate.fromTemplate(basicAcademicSearchRetrieverPrompt),
    llm,
    strParser,
    RunnableLambda.from(async(input:string) => {

        if(input === 'not_needed'){
            return{query:"",docs: []}
        };

        const res=await searchSearxng(input, {
            language: 'en',
            engines: [
                "arxiv",
                "google scholar",
                "pubmed",
                "crossref"
            ],
        });
      
        const documents= res.results.map((result) =>  new Document({
            pageContent: result.content,
            metadata: {
                title: result.title,
                url: result.url,
                ...(result.img_src && { img_src: result.img_src }),
            },
        }));

        return { query: input, docs: documents}

    }),
]);
};



const createBasicAcademicSearchAnsweringChain= (llm: BaseChatModel, embeddings: Embeddings) => {

  const basicAcademicSearchRetrieverChain =
    createBasicAcademicSearchRetrieverChain(llm);

    const processDocs = async (docs: Document[]) => {
      return docs
        .map((_, index) => `${index + 1}. ${docs[index].pageContent}`)
        .join("\n");
    };
    
    const rerankDocs= async({query,docs}:{query:string;docs: Document[]}) => {
    
            if(docs.length === 0){
              return docs
            };
    
            const docsWithContent= docs.filter((doc)=> doc.pageContent && doc.pageContent.length > 0)
    
            const [docEmbeddings,queryEmbedding]=await Promise.all([
                embeddings.embedDocuments(docsWithContent.map((doc)=> doc.pageContent)),
                embeddings.embedQuery(query)
            ]);
    
            const similarity= docEmbeddings.map((docEmbdeding,i) => {
                 const sim= computeSimilarity(queryEmbedding, docEmbdeding);
    
                 return {
                    index: i,
                    similarity: sim
                 }
            });
    
            const sortedDocs=similarity
              .sort((a,b) => b.similarity - a.similarity)
              .filter((sim) => sim.similarity > 0.5)  
              .slice(0, 15)
              .map((sim) => docsWithContent[sim.index])  
    
    
              return sortedDocs;
    };
    

  return RunnableSequence.from([
    RunnableParallel.from({
        query: (input: BasicChainInput) => input. query,
        chat_history: (input: BasicChainInput) => input.chat_history,
        context: RunnableSequence.from([
            (input)=> ({
                query: input.query,
                chat_history: formatChatHistoryAsString(input.chat_history)
            }),
                basicAcademicSearchRetrieverChain
               .pipe(rerankDocs)
               .pipe(processDocs)
               .withConfig({
                runName: "AcademicSourceRetrieval"
               })
        ]),
    }),
    ChatPromptTemplate.fromMessages([
      ["system", basicAcademicSearchResponsePrompt],
      new MessagesPlaceholder("chat_history"),
      ['user', "{query}"]      
    ]),
    llm,
    strParser,
]).withConfig({
   runName: "AcademicResponseGenerator"
});
};


const basicAcademicSearch =(
  query:string, 
  history: BaseMessage[],
  llm:BaseChatModel, 
  embeddings: Embeddings
  ) => {
     const emitter= new EventEmitter();

     try{
       const basicAcademicSearchAnsweringChain =
              createBasicAcademicSearchAnsweringChain(llm, embeddings);
        const stream= basicAcademicSearchAnsweringChain.streamEvents(
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



const handleAcademicSearch=(
   message: string,
   history: BaseMessage[],
   llm:BaseChatModel, 
   embeddings: Embeddings
   )=>{

   const emitter=basicAcademicSearch(message, history,llm,embeddings);

   return emitter;
};


export default handleAcademicSearch;
