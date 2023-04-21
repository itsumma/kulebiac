import * as fs from "fs";

export function readfile(filePath: string){
    return fs.readFileSync(filePath, 'utf-8')
}