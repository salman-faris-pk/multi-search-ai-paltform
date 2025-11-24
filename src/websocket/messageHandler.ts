import { AIMessage, BaseMessage, HumanMessage } from 'langchain';
import { WebSocket } from 'ws'
import handleWebSearch from '../agents/webSearchAgent.js';


type Message ={
  type:string;
  content: string;
  copilot: string;
  focus:string;
  history: Array<[string, string]>
};



export const handleMessage = async(message:string,ws:WebSocket)=>{
    try {

        const parsedMessage = JSON.parse(message) as Message;
        const id = crypto.randomUUID().replace(/-/g, '').substring(0, 10);


        if (!parsedMessage.content) {
          return ws.send(
            JSON.stringify({ type: "error", data: "Invalid message format" })
          );
        };

        const history:BaseMessage[]= parsedMessage.history.map((msg) => {
            if(msg[0] === "human"){
                return new HumanMessage({
                    content: msg[1]
                });
            }else{
                return new AIMessage({
                    content: msg[1]
                })
            }
        });

        if(parsedMessage.type === "message"){

            parsedMessage.focus= "webSearch"

            switch(parsedMessage.focus){
                case 'webSearch':{
                    const emitter=handleWebSearch(parsedMessage.content, history)
                   
                   emitter.on("data", (data) => {
                     const parsedData = JSON.parse(data);
                     const messageType = parsedData.type === "respose" ? "messsage": parsedData.type;

                     ws.send(
                       JSON.stringify({
                         type: messageType,
                         data: parsedData.data,
                         messageId: id,
                       })
                     );
                   });

                    emitter.on("end", ()=>{
                         ws.send(JSON.stringify({ type: "messageEnd", messageId: id }));
                    })
                    emitter.on("error",(data)=>{
                        const parsedData = JSON.parse(data);
                        ws.send(JSON.stringify({ type: "error", data: parsedData.data }));
                    })
                }
            }

        }
        
    } catch (error) {
       console.error("Failed to handle message", error);
       ws.send(JSON.stringify({ type: "error", data: "Invalid message format" }));
    }
}