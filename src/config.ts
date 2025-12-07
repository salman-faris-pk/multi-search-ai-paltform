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
        CHAT_MODEL_PROVIDER: string;
        CHAT_MODEL: string;
    },
    API_KEYS: {
      GEMINI: string;
      GROQ: string;
    },
    API_ENDPOINTS: {
      SEARXNG: string;
      OLLAMA: string;
    }
};



const loadConfig = () => 
      toml.parse(fs.readFileSync(path.join(__dirname, `../${configFile}`), "utf-8")
 ) as any as Config;


export const getPort =()=> loadConfig().GENERAL.PORT;

export const getSimilarityMeasure = () => loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getGeminaiApiKey = () => loadConfig().API_KEYS.GEMINI;

export const getGroqApiKey = () => loadConfig().API_KEYS.GROQ;

export const getSearxngApiEndpoint = () => loadConfig().API_ENDPOINTS.SEARXNG;

export const getChatModelProvider = () => loadConfig().GENERAL.CHAT_MODEL_PROVIDER;

export const getOllamaApiEndpoint = ()=> loadConfig().API_ENDPOINTS.OLLAMA;

export const getChatModel = () => loadConfig().GENERAL.CHAT_MODEL;


// every property optional, including nested ones, at all levels.
 type RecursivePartial<T> = {                  
   [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};


export const updateConfig = (config: RecursivePartial<Config>) =>  {
   const currentConfig=loadConfig();

   for(const key in currentConfig){            //Keys = "GENERAL", "API_KEYS", "API_ENDPOINTS"
      if(currentConfig[key] && typeof currentConfig[key] === "object"){  //If key is an object
         for(const nestedkey in currentConfig[key]){                    //Nested keys like port,similaritymeasure,chat model...
             if(currentConfig[key][nestedkey] && !config[key][nestedkey] && config[key][nestedkey] !== ""){
                config[key][nestedkey] = currentConfig[key][nestedkey]   //Fill missing values using old config
             }
         }
      }else if(currentConfig[key] && !config[key] && config[key] !== ""){  //Handle non-object values
         config[key] = currentConfig[key]     
      }
   };

     //Save new updated config back to file
     fs.writeFileSync(path.join(__dirname, `../${configFile}`), toml.stringify(config));
};

