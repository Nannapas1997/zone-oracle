const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.text({ type: "*/*" }));

let latestPrice = { bid: 0, ask: 0 };

app.post("/price", (req, res) => {
  try {
    const cleanBody = String(req.body || "").replace(/\0/g, "").trim();
    latestPrice = JSON.parse(cleanBody);

    console.log("PRICE:", latestPrice);
    res.json({ ok: true });
  } catch (err) {
    console.log("BAD BODY:", req.body);
    res.status(400).json({ ok: false });
  }
});

app.get("/price", (req, res) => {
  res.json(latestPrice);
});

app.listen(3002, () => {
  console.log("MT5 PRICE SERVER RUNNING ON 3002");
});