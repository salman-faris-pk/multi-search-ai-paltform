import toml from "@iarna/toml"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configFile= "config.toml"


interface Config{
    GENERAL: {
        PORT: number;
        SIMILARITY_MEASURE: string;
    };
    API_KEYS: {
      GOOGLE_API_KEY: string;
    },
    API_ENDPOINTS: {
      SEARXNG: string;
    }
};



const loadConfig = () => 
      toml.parse(fs.readFileSync(path.join(__dirname, `../${configFile}`), "utf-8")
 ) as any as Config;


export const getPort =()=> loadConfig().GENERAL.PORT;

export const getSimilarityMeasure = () => loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getGeminaiApiKey = () => loadConfig().API_KEYS.GOOGLE_API_KEY;

export const getSearxngApiEndpoint = () => loadConfig().API_ENDPOINTS.SEARXNG;