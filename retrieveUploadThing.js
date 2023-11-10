// const https = require("https");
import https from "https"
import { UTApi } from "uploadthing/server";
import fs from 'fs'

const utapi = new UTApi();

async function downloadTextFileFromBlob(uploadThing) {
  const blobUrl = uploadThing[0].url;
   
  return new Promise((resolve, reject) => {
    https
      .get(blobUrl, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

export async function getDataSourceFromUploadThing(ut_key) {
  const uploadThing = await utapi.getFileUrls(ut_key);


  const retrievedTextFile = await downloadTextFileFromBlob(uploadThing);

  const dir = `./data/${ut_key}`;
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir, {recursive:true});
    fs.writeFileSync(`./data/${ut_key}/${ut_key}`, retrievedTextFile);
  }
  return ut_key;
}


export async function writeToSource(ut_key){
  const uploadThing = await utapi.getFileUrls(ut_key);
  let retrievedTextFile = await downloadTextFileFromBlob(uploadThing);
  console.log(ut_key)
  console.log(retrievedTextFile)

  retrievedTextFile = `\n==${ut_key}==\n` + retrievedTextFile + `\n==${ut_key}==`


  const mainDataSrcPath = './data/main.txt'

  fs.appendFileSync(mainDataSrcPath, retrievedTextFile, (err)=>{
    if(err){
      console.log(err)
      return err
    }else{
      console.log("success");
      return "Success"
    }
  })
}
