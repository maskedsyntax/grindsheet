import { applyToggle, emptyProgress, encodeProgress } from "./progress.mjs";

const allowedOrigin =
  /^(https:\/\/grindsheet\.maskedsyntax\.com|https:\/\/maskedsyntax\.github\.io|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;

export default {
  fetch(request, env) {
    return handle(request, env);
  },
};

export async function handle(request, env, github = realGithub) {
  const origin = request.headers.get("Origin");

  if (request.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }), origin);
  }

  if (request.method !== "POST") {
    return cors(json({ error: "POST only." }, 405), origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return cors(json({ error: "Expected JSON." }, 400), origin);
  }

  if (!(await passphraseOk(body?.passphrase, env.PASSPHRASE))) {
    return cors(json({ error: "Wrong passphrase." }, 401), origin);
  }

  const slug = body?.slug;
  const solved = body?.solved;
  const message = `mark ${typeof slug === "string" ? slug : "problem"} ${solved ? "solved" : "unsolved"}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    let current;
    try {
      current = await github.read(env);
    } catch {
      return cors(json({ error: "Could not read progress." }, 502), origin);
    }

    const applied = applyToggle(
      current.doc,
      slug,
      solved,
      new Date().toISOString(),
    );
    if (applied.error) {
      return cors(json({ error: applied.error }, 400), origin);
    }
    if (!applied.changed) {
      return cors(
        json({
          sha: current.sha,
          solved: applied.doc.solved,
          updatedAt: applied.doc.updatedAt,
        }),
        origin,
      );
    }

    let put;
    try {
      put = await github.write(env, applied.doc, current.sha, message);
    } catch {
      return cors(json({ error: "Could not save." }, 502), origin);
    }
    if (put.ok) {
      return cors(
        json({
          sha: put.sha,
          solved: applied.doc.solved,
          updatedAt: applied.doc.updatedAt,
        }),
        origin,
      );
    }
    if (put.status !== 409) {
      return cors(json({ error: "Could not save." }, 502), origin);
    }
  }

  return cors(json({ error: "Could not save, try again." }, 409), origin);
}

async function realGithubRead(env) {
  const url = `https://api.github.com/repos/${env.REPO}/contents/${env.PROGRESS_PATH}?ref=${env.BRANCH}`;
  const response = await fetch(url, { headers: githubHeaders(env) });
  if (response.status === 404) {
    return { sha: null, doc: emptyProgress() };
  }
  if (!response.ok) {
    throw new Error("read failed");
  }
  const body = await response.json();
  const text = new TextDecoder().decode(
    Uint8Array.from(atob(body.content.replace(/\s/g, "")), (char) =>
      char.charCodeAt(0),
    ),
  );
  return { sha: body.sha, doc: JSON.parse(text) };
}

async function realGithubWrite(env, doc, sha, message) {
  const url = `https://api.github.com/repos/${env.REPO}/contents/${env.PROGRESS_PATH}`;
  const payload = {
    message,
    content: btoa(encodeProgress(doc)),
    branch: env.BRANCH,
  };
  if (sha) payload.sha = sha;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...githubHeaders(env),
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 409) return { ok: false, status: 409 };
  if (!response.ok) return { ok: false, status: response.status };
  const body = await response.json();
  return { ok: true, sha: body.content?.sha ?? null };
}

const realGithub = {
  read: realGithubRead,
  write: realGithubWrite,
};

function githubHeaders(env) {
  return {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "user-agent": "grindsheet",
    "x-github-api-version": "2022-11-28",
  };
}

async function passphraseOk(given, expected) {
  if (typeof given !== "string" || typeof expected !== "string" || !expected) {
    return false;
  }
  const left = new TextEncoder().encode(given);
  const right = new TextEncoder().encode(expected);
  if (left.byteLength !== right.byteLength) return false;
  if (crypto.subtle?.timingSafeEqual) {
    return crypto.subtle.timingSafeEqual(left, right);
  }
  let mismatch = 0;
  for (let i = 0; i < left.length; i++) mismatch |= left[i] ^ right[i];
  return mismatch === 0;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function cors(response, origin) {
  const headers = new Headers(response.headers);
  if (origin && allowedOrigin.test(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "Origin");
  }
  headers.set("access-control-allow-methods", "POST, OPTIONS");
  headers.set("access-control-allow-headers", "Content-Type");
  headers.set("access-control-max-age", "86400");
  return new Response(response.body, { status: response.status, headers });
}
