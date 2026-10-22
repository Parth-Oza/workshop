"use strict";

const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");

function readPosts(dataFile) {
  if (!fs.existsSync(dataFile)) {
    return [];
  }
  const payload = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  if (!Array.isArray(payload)) {
    throw new TypeError("posts data must be a JSON array");
  }
  return payload;
}

function createApp(options = {}) {
  const dataFile = options.dataFile || path.join(__dirname, "posts.json");
  const staticRoot = options.staticRoot || path.join(__dirname, "root");
  const posts = readPosts(dataFile);
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "16kb" }));
  app.use(express.static(staticRoot));

  app.get("/post", (_request, response) => {
    response.json(posts);
  });

  app.post("/post", (request, response) => {
    const title = typeof request.body?.title === "string" ? request.body.title.trim() : "";
    const description = typeof request.body?.desc === "string" ? request.body.desc.trim() : "";
    if (!title || !description || title.length > 120 || description.length > 2_000) {
      response.status(400).json({
        error: "title and desc are required and must stay within their size limits",
      });
      return;
    }
    const post = { title, desc: description };
    posts.push(post);
    fs.writeFileSync(dataFile, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
    response.status(201).json(post);
  });

  return app;
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  createApp().listen(port, () => {
    console.log(`listening on port ${port}`);
  });
}

module.exports = { createApp, readPosts };
