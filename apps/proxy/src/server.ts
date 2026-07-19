import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

const DEFAULT_BW_URL = "http://localhost:8087";

function getTargetUrl(req: express.Request): URL {
  const bwUrl = req.header("X-Bitwarden-Url") ?? DEFAULT_BW_URL;
  const path = typeof req.params.path === "string" ? req.params.path : req.params.path.join("/")
  return new URL(path, bwUrl.endsWith("/") ? bwUrl : bwUrl + "/");
}

app.all("/*path", async (req, res) => {
  try {
    const target = getTargetUrl(req);

    const response = await fetch(target, {
      method: req.method,
      headers: {
        ...(req.method === "GET" ? {} : { "Content-Type": "application/json" })
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const text = await response.text();

    res.status(response.status);

    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    res.send(text);
  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "Unable to reach Bitwarden server",
    });
  }
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});