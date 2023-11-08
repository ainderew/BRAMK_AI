import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import { main } from "../../index.js";


const app = express();
const port = 2121;



app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post("/", async (req, res) => {
  const data  = req.body.data;

  const val = await main(data[data.length - 1].content)
  res.send(val)
});

// to test if api is available
app.get("/test",async (req, res) =>{
  const val = await main("who is andrew pinon")
  res.send({
    message: "HELLO",
    test: val
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});