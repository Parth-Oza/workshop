"use strict";

const form = document.querySelector("#post-form");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const list = document.querySelector("#posts");
const status = document.querySelector("#status");

function renderPost(post) {
  const item = document.createElement("p");
  const title = document.createElement("strong");
  title.textContent = post.title;
  item.append(title, document.createTextNode(` — ${post.desc}`));
  list.append(item);
}

async function loadPosts() {
  const response = await fetch("/post");
  if (!response.ok) {
    throw new Error(`Unable to load posts (${response.status})`);
  }
  const posts = await response.json();
  list.replaceChildren();
  posts.forEach(renderPost);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "Saving…";
  try {
    const response = await fetch("/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleInput.value,
        desc: descriptionInput.value,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `Unable to save (${response.status})`);
    }
    renderPost(payload);
    form.reset();
    status.textContent = "Saved.";
  } catch (error) {
    status.textContent = error.message;
  }
});

loadPosts().catch((error) => {
  status.textContent = error.message;
});
