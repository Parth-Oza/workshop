"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { createApp, readPosts } = require("../index");

async function withServer(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workshop-test-"));
  const dataFile = path.join(directory, "posts.json");
  fs.writeFileSync(dataFile, '[{"title":"Existing","desc":"Post"}]\n');
  const server = createApp({ dataFile }).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  try {
    await callback(`http://127.0.0.1:${address.port}`, dataFile);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test("GET /post returns stored posts", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/post`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ title: "Existing", desc: "Post" }]);
  });
});

test("POST /post validates and persists a normalized post", async () => {
  await withServer(async (baseUrl, dataFile) => {
    const response = await fetch(`${baseUrl}/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "  New title  ", desc: "  Description  " }),
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
      title: "New title",
      desc: "Description",
    });
    assert.deepEqual(readPosts(dataFile), [
      { title: "Existing", desc: "Post" },
      { title: "New title", desc: "Description" },
    ]);
  });
});

test("POST /post rejects incomplete data", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Missing description" }),
    });
    assert.equal(response.status, 400);
  });
});
