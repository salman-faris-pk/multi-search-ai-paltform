import { Document } from "@langchain/core/documents"
import computeSimilarity from "./computeSimilarity.js";
import { Embeddings } from "@langchain/core/embeddings";


export const processDocs = async (docs: Document[]) => {
  return docs
    .map((_, index) => `${index + 1}. ${docs[index].pageContent}`)
    .join("\n");
};

const rerankDocs= async(
    embeddings: Embeddings,
    {query,docs}:{query:string,docs: Document[]}
  ) => {

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

export const createRerankDocs = (embeddings: Embeddings) =>   //its closure ,First function takes embeddings.
  (input: { query: string; docs: Document[] }) =>          //It returns another function that takes query + docs. and query gets from retrieval chain
    rerankDocs(embeddings, input);                          //Then it calls rerankDocs() using both.