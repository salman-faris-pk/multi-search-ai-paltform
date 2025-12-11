import { BaseOutputParser } from "@langchain/core/output_parsers";




interface LineListOutputParseArgs {
    key?: string;
};

class LineListOutputParser extends BaseOutputParser<String[]> {
        
    private key="questions";

    constructor(args?: LineListOutputParseArgs){
        super();    //initialize parent class ,here extended  BaseOutputParser is parent class
        this.key = args.key ?? this.key;  //here overriden by incoming args key
    }

    static lc_name(): string {  //a readable identifier LangChain uses during serialization, debugging, and tracing.
        return "LineListOutputParser"
    };

    // Required because BaseOutputParser has this as an abstract property .Used by LangChain for internal metadata (serialization/tracing).
     lc_namespace = ["langchain", "output_parsers", "line_list_output_parser"];

     async parse(text: string ): Promise<String[]> {
          const regex= /^(\s*(-|\*|\d+\.\s|\d+\)\s|\u2022)\s*)+/;  //removes all bulletpoints,* ,)..
          const startkeyIndex= text.indexOf(`<${this.key}>`);  //<questions> or <suggestions> strat from  starting tag
          const endKeyIndex= text.indexOf(`</${this.key}>`);   // </questions> or </sugestions> ends at ending close tag
          const questionsStartIndex = startkeyIndex === -1 ?  0 : startkeyIndex + `<${this.key}>`.length;
          const questionsEndIndex = endKeyIndex === -1 ? text.length : endKeyIndex;

          const lines= text
                 .slice(questionsStartIndex, questionsEndIndex)
                 .trim()
                 .split("\n")
                 .filter((line) => line.trim() !== "")
                 .map((line) => line.replace(regex, ""))

          return lines;
     };

   

     getFormatInstructions(): string {
          throw new Error("Not implemented")
     };


};



export default LineListOutputParser;