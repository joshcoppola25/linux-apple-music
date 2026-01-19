import { execSync } from 'child_process';
import path from 'path';

export function fetchFreshDevToken(): string {
    try {
        const generatorPath = path.resolve(__dirname, '../scripts/generateToken.js');
        
        console.log("Generating fresh Developer Token...");
        
        const token = execSync(`node ${generatorPath}`).toString().trim();
        
        return token;
    } catch (error) {
        console.error("Failed to generate dev token:", error);
        throw new Error("Dev Token Generation Failed");
    }
}