import "dotenv/config";
import fs from "fs";
import path from "path";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import {
  DirectoryLoader,
  UnknownHandling,
} from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { NotionLoader } from "langchain/document_loaders/fs/notion";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {getDataSourceFromUploadThing} from "./retrieveUploadThing.js";


// Constants 
const DATA_DIR = "./data";
const OPENAI_API_MODEL_NAME = "gpt-4"; // DO NOT TOUCH AKO NI GI SET PARA MAS MO LESS BAYRANAN -Andrew Pinon
const OPENAI_API_KEY = process.env.OPENAI_KEY
console.log(OPENAI_API_KEY)

export async function main(options) {

  const {query, isSpecific, UT_key} = options
  const chain = await setupLLMChain(isSpecific, UT_key);
  const result = await endlessLoop(chain, query);
  return result
}

// Load documents to LLM and create a retrieval chain
async function setupLLMChain(isSpecific, ut_key) {
  let docs;

  if(isSpecific){
    // const file = await getDataSourceFromUploadThing(ut_key)
    // const plainDocs = await loadPlainDocuments(file);
    const markdownDocs = await loadMarkdownDocuments();
    const pdfDocs = await loadPdfDocuments();
    docs = [...markdownDocs, ...pdfDocs];
  }else{
    const plainDocs = await loadPlainDocuments();
    const markdownDocs = await loadMarkdownDocuments();
    const pdfDocs = await loadPdfDocuments();
    docs = [...plainDocs, ...markdownDocs, ...pdfDocs];
  }

  const model = new ChatOpenAI({
    modelName: OPENAI_API_MODEL_NAME,
    openAIApiKey: OPENAI_API_KEY,
    temperature: 0,
  });

  const splitDocs = await splitDocuments(docs);
  const vectorStore = await storeDocuments(splitDocs);

  return RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    returnSourceDocuments: true,
  });
}

// Load documents from the specified directory
async function loadPlainDocuments(path=null) {
  let NEW_DIR = DATA_DIR;
  if(path){
    NEW_DIR = `${DATA_DIR}/${path}`
  }
  console.log(NEW_DIR)
  const loader = new DirectoryLoader(
    NEW_DIR,
    {
      ".json": (path) => new JSONLoader(path),
      ".txt": (path) => new TextLoader(path),
      ".csv": (path) => new CSVLoader(path),
    },
    true,
    UnknownHandling.Ignore
  );

  return loader.load();
}

async function loadMarkdownDocuments() {
  const loader = new NotionLoader(DATA_DIR);

  return await loader.load();
}

async function loadPdfDocuments() {
  let pdfs = [];
  const fileNames = scanForPDFs(DATA_DIR);

  for (const fileName of fileNames) {
    const loader = new PDFLoader(`${fileName}`);
    const pdfDocs = await loader.load();
    pdfs = [...pdfs, ...pdfDocs];
  }

  return pdfs;
}

// Split documents using the text splitter
async function splitDocuments(docs) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 8000,
    chunkOverlap: 0,
  });

  return textSplitter.splitDocuments(docs);
}

async function storeDocuments(splitDocs) {
  return MemoryVectorStore.fromDocuments(splitDocs, new OpenAIEmbeddings({openAIApiKey:OPENAI_API_KEY},{apiKey:OPENAI_API_KEY}));
}

async function endlessLoop(chain, query) {

  const response = await chain.call({
    query: query,
  });

  return response.text;

}

function scanForPDFs(directory) {
  const pdfFiles = [];

  function scanDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isFile() && path.extname(file).toLowerCase() === ".pdf") {
        pdfFiles.push(filePath);
      } else if (stats.isDirectory()) {
        scanDir(filePath);
      }
    }
  }

  scanDir(directory);
  return pdfFiles;
}
