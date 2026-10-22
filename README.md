# Node.js Workshop

A small Express workshop application that stores posts in a local JSON file and serves a browser client.

## Run

```bash
npm ci
npm start
```

Open `http://localhost:3000`.

## Verify

```bash
npm test
npm audit --audit-level=high
```

The server exports `createApp` so API behavior can be tested without binding a fixed port. POST input is bounded and validated, the client renders user content with `textContent`, and CI verifies both tests and dependency advisories.
