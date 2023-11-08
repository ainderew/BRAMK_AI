// const https = require("https");
import https from "https"
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export default async function getDataSourceFromUploadThing() {
  const test = await utapi.getFileUrls(
    "1606bf56-acd1-4ff0-851b-3c93e46b33d1-etr8bp.txt"
  );

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
  const g = await downloadTextFileFromBlob();

  return g;
}
