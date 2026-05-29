import { GoogleGenAI } from "@google/genai";

import "dotenv/config";
import { exec } from "child_process"
import util from "util"
import os from "os"

const execute = util.promisify(exec)
const platform = os.platform()


async function executeCommand({ cmd }) {
    try {
        const shell = platform === "win32" ? "powershell.exe": (platform === "darwin" ? "/bin/zsh" : "/bin/bash");
        const { stdout, stderr } = await execute(cmd, { shell })
        if (stderr) {
            return `Error:${stderr}`
        }
        return `Stdout:${stdout}`
    } catch (error) {
        return `Error:${error}`
    }
}

export const tools = {
    "executeCommand":executeCommand
}