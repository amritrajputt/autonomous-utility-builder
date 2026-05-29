import { Type } from "@google/genai";
export const cmdInfo = {
    name: "executeCommand",
    description: "takes a command and executes it.it will helpus to do any crud operation on our computer",
    parameters: {
        type: Type.OBJECT,
        properties: {
            cmd: {
                type: Type.STRING,
                description: "The command to execute. e.g mkdir calculator, ni index.js etc. Don't add '&&' in the command. Always execute only one command."
            }
        },
        required: ["cmd"]
    }
}

export const tools = [{ functionDeclarations: [cmdInfo] }] 