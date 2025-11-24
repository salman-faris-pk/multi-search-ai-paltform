import dot from "compute-dot";
import cosineSimilarity from "compute-cosine-similarity"

const computeSimilarity = (x: number[], y: number[]): number => {
  const similarityMeasure = process.env.SIMILARITY_MEASURE;

  if (similarityMeasure === "cosine") {
    return cosineSimilarity(x, y);
  }

  if (similarityMeasure === "dot") {
    return dot(x, y);
  }

  throw new Error("Invalid similarity measure");
};

export default computeSimilarity;
