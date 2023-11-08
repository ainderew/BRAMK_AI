// const https = require("https");
import https from "https"
import { UTApi } from "uploadthing/server";
import fs from 'fs'

const utapi = new UTApi();

export default async function getDataSourceFromUploadThing(ut_key) {
  const test = await utapi.getFileUrls(ut_key);

  async function downloadTextFileFromBlob() {
    const blobUrl = test[0].url;
     
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
  const retrievedTextFile = await downloadTextFileFromBlob();

  const dir = `./data/${ut_key}`;
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir, {recursive:true});
    fs.writeFileSync(`./data/${ut_key}/${ut_key}`, retrievedTextFile);
  }
  return ut_key;
}
