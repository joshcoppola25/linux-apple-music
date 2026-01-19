import { execSync } from 'child_process';
import path from 'path';

export function fetchFreshDevToken(): string {
    try {
        const rawOutput = execSync(`node ${path.resolve(__dirname, '../scripts/generateToken.js')}`).toString();
        const tokenMatch = rawOutput.match(/eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/);
        
        if (!tokenMatch) {
            throw new Error("Could not find a valid JWT in script output: " + rawOutput);
        }

        return tokenMatch[0];
    } catch (error) {
        console.error("Failed to generate dev token:", error);
        throw error;
    }
}