import assert from "node:assert/strict";
import test from "node:test";
import { applyToggle, encodeProgress } from "./progress.mjs";
import { handle } from "./index.js";

test("applyToggle adds, removes, and ignores a repeat", () => {
  const added = applyToggle(
    { version: 1, updatedAt: null, solved: ["valid-anagram"] },
    "two-sum",
    true,
    "2026-11-19T00:00:00.000Z",
  );
  assert.equal(added.changed, true);
  assert.deepEqual(added.doc.solved, ["two-sum", "valid-anagram"]);

  const again = applyToggle(added.doc, "two-sum", true, "later");
  assert.equal(again.changed, false);

  const removed = applyToggle(added.doc, "two-sum", false, "later");
  assert.deepEqual(removed.doc.solved, ["valid-anagram"]);
  assert.equal(removed.doc.updatedAt, "later");
});

test("applyToggle rejects a slug that is not a problem id", () => {
  const result = applyToggle({ solved: [] }, "../README", true, "now");
  assert.equal(result.error, "Unknown problem.");
});

test("encodeProgress keeps a trailing newline", () => {
  const text = encodeProgress({ version: 1, updatedAt: null, solved: [] });
  assert.equal(text.endsWith("\n"), true);
  assert.deepEqual(JSON.parse(text).solved, []);
});

test("a wrong passphrase does not read or write the repo", async () => {
  let called = false;
  const github = {
    read() {
      called = true;
      return { sha: null, doc: { solved: [] } };
    },
    write() {
      called = true;
      return { ok: true, sha: "abc" };
    },
  };

  const response = await handle(post({ slug: "two-sum", solved: true, passphrase: "nope" }), {
    PASSPHRASE: "correct",
  }, github);

  assert.equal(response.status, 401);
  assert.equal(called, false);
});

test("a toggle writes the merged list and retries a conflict once", async () => {
  const writes = [];
  let reads = 0;
  const github = {
    async read() {
      reads += 1;
      if (reads === 1) return { sha: "old", doc: { version: 1, solved: [] } };
      return { sha: "new", doc: { version: 1, solved: ["valid-anagram"] } };
    },
    async write(_env, doc, sha) {
      writes.push({ doc, sha });
      if (sha === "old") return { ok: false, status: 409 };
      return { ok: true, sha: "saved" };
    },
  };

  const response = await handle(
    post(
      { slug: "two-sum", solved: true, passphrase: "correct" },
      "https://grindsheet.maskedsyntax.com",
    ),
    { PASSPHRASE: "correct" },
    github,
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://grindsheet.maskedsyntax.com");
  const body = await response.json();
  assert.deepEqual(body.solved, ["two-sum", "valid-anagram"]);
  assert.equal(writes.at(-1).sha, "new");
});

function post(body, origin) {
  const headers = { "content-type": "application/json" };
  if (origin) headers.origin = origin;
  return new Request("https://worker.test/", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
