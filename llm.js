import readline from "readline-sync";
import { tools } from "./index.js"
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import {cmdInfo} from "./commandInfo.js";
import os from "os";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const history = []
async function buildTools(prompt) {
    history.push({ role: "user", parts: [{ text: prompt }] })

    while (true) {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history,
            config: {
                systemInstruction: `you are a utility/tool builder , you have to build the utility or tools that solve user small problem using code just like a pdf to text extractor,
                 section extractor. you dont have to build end to end website but you have to build small utilities on the basis of user request.
                 you can build files folder using the function 'executeCommand'. you have full command over the system so use it wisely. only execute commands related to task you are assigned to do. 
                 also take care about users os so give appropriate command as the user will provide it in prompt and it should supported by their os.
                 Current OS platform is: ${os.platform()} (so use Windows PowerShell commands since platform is win32).
                 ex:
                 1.analyze the users query
                 2. take necessary action according to query using 'executeCommand'
                 3. use best practice for commands.  
                 4. make sure you dont mess with user files/folder
                 5. make sure you dont execute any command that can harm the user
                 6. make sure you dont execute any dangerous commands like rm -rf etc
                 YOUR JOB:
                   1. take the user prompt and understand it
                   2. take the necessary action according to query using 'executeCommand'
                   3.return the result to the user
                   4.if user ask for anything else, repeat the process
                 `,
                tools: [
                    {
                        functionDeclarations: [cmdInfo]
                    }
                ]
            }
        })
        if (result.functionCalls && result.functionCalls.length > 0) {
            const fnCall = result.functionCalls[0]
            const { name, args } = fnCall
            
            console.log(`\n[Tool Call] Executing: ${name} with args:`, JSON.stringify(args));
            const response = await tools[name](args)
            console.log(`[Tool Response]:`, response);

            history.push({
                role: "model",
                parts: [{ functionCall: fnCall }]
            })
            history.push({
                role: "user",
                parts: [{
                    functionResponse: {
                        name: fnCall.name,
                        response: { output: response },
                        id: fnCall.id
                    }
                }]
            })
        } else {
            history.push({
                role: "model",
                parts: [{ text: result.text }]
            })
            return result.text
        }
    }
}


while (true) {
    const userPrompt = readline.question(">> ask me anything: ")
    if (userPrompt == "exit") break
    const response = await buildTools(userPrompt)
    console.log(response)
    console.log("-------------------------------------------------------------")
}