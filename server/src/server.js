import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import { main } from "../..";


const app = express();
const port = 2121;



app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post("/", async (req, res) => {
  const data  = req.body.data;
  console.log(data[data.length - 1].content)
  console.log("data")
  console.log(data)

  const val = await main(data[data.length - 1].content)
  res.send(val)
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});