import axios from "axios";
import { getSearxngApiEndpoint } from "../config.js";


interface SearxngSearchOption {
    categories?:string[];
    engines?: string[];
    language?:string;
    pageno?:number;
}

interface SearxngSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
  iframe_src?: string;
}


export const searchSearxng =async(query:string,opts?: SearxngSearchOption)=>{
      
    const searxngUrl= getSearxngApiEndpoint();
    const url= new URL(`${searxngUrl}/search?format=json`);
    url.searchParams.append('q',query);

    if(opts){
        Object.keys(opts).forEach((key) => {
           if(Array.isArray(opts[key])) {    //if any of values in array 
             url.searchParams.append(key, opts[key].join(",")); // then covert into string
             return;
           }
           url.searchParams.append(key, opts[key])
        });
    }

    const res = await axios.get(url.toString());
    
    const results: SearxngSearchResult[]= res.data.results;
    const suggestions : string[]= res.data.suggestions;

    return { results,suggestions }

};

