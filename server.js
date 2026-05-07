const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());           
app.use(express.json());

let topics = [];

// 전체 조회
app.get("/topics", (req, res) => {
  res.json(topics);
});

// 생성
app.post("/topics", (req, res) => {
  console.log("POST 들어옴🔥", req.body);

  const newTopic = {
    id: Date.now(),
    title: req.body.title,
    body: req.body.body
  };

  topics.push(newTopic);
  res.json(newTopic);
});

// 상세
app.get("/topics/:id", (req, res) => {
  const topic = topics.find(t => t.id == req.params.id);
  res.json(topic);
});

// 수정
app.patch("/topics/:id", (req, res) => {
  const topic = topics.find(t => t.id == req.params.id);
  topic.title = req.body.title;
  topic.body = req.body.body;
  res.json(topic);
});

// 삭제
app.delete("/topics/:id", (req, res) => {
  topics = topics.filter(t => t.id != req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 9999;

app.listen(PORT, () => {
  console.log(`API 서버 실행: ${PORT}`);
});