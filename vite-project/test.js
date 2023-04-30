//test
import * as fs from 'fs';

let txt = fs.readFileSync("./publicatoin.bib").toString("utf-8")
console.log(txt)
let parsed_txt = BibtexParser(txt)
console.log(parsed_txt)