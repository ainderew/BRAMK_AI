import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { main } from "../../index.js";
import { writeToSource } from "../../retrieveUploadThing.js";

const app = express();
const port = 2121;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const {data, UT_key} = req.body;
console.log(req.body)
  let isSpecific = false
  if(UT_key){
    isSpecific = true;
  }
console.log("RESPONSE HIT")
  const val = await main({
    query: data[data.length - 1].content,
    isSpecific: isSpecific,
    UT_key: UT_key
  });
  res.send(val);
});

app.post("/newfile", async (req, res) => {
  const { data } = req.body;
  writeToSource(data);

  res.send({
    test: data,
  });
});

// to test if api is available
app.get("/test", async (req, res) => {
  console.log("HIT");
  const val = await main({ query: "who is andrew pinon", isSpecific: true });
  res.send({
    message: "HELLO",
    test: val,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
