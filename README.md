# Grindsheet

A one-page checklist for the NeetCode 150. The page is a Gleam [Lustre](https://hexdocs.pm/lustre/) app, published to GitHub Pages at [grindsheet.maskedsyntax.com](https://grindsheet.maskedsyntax.com).

Solved state lives in [`progress.json`](progress.json) in this repo. Any browser reads the same file. Ticking a box sends the change to a Cloudflare Worker, which commits the file. Nothing is stored as the source of truth in the browser. The passphrase is kept in local storage, so each browser asks for it once.

## Running it

```sh
gleam run -m catalog_build   # problemset/problems.md -> assets/catalog.json
gleam run -m lustre/dev start
gleam test
node --test worker/progress.test.mjs
```

`catalog_build` has to run again after you edit the problem list. The dev server does not watch that file.

## The problem list

[`problemset/problems.md`](problemset/problems.md) is the list: a heading per topic, then a markdown link per problem. The checkbox in that file is ignored. A problem's identity is the slug in its LeetCode URL (`two-sum`), so titles can be reworded and rows can move without clearing a tick.

## Marking a problem solved

The site reads progress from the GitHub contents API:

`https://api.github.com/repos/maskedsyntax/grindsheet/contents/progress.json?ref=master`

Writes go to the Worker. The URL in `src/grindsheet/remote.gleam` is `https://grindsheet.maskedsyntax.workers.dev`, which is what you get when the Worker name is `grindsheet` and the account's `workers.dev` subdomain is `maskedsyntax`. `wrangler deploy` prints the real URL. If it differs, change that constant and rebuild the site. The Worker holds a fine-grained GitHub token that can only read and write this repo, plus a passphrase. Neither secret is in the site.

From `worker/`, with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged into the Cloudflare account that should own the script:

```sh
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put PASSPHRASE
npx wrangler deploy
```

The token needs Contents read and write on `maskedsyntax/grindsheet` only. `worker/wrangler.toml` sets the repo, branch, and path.

Type the passphrase once in the page. It is sent with each tick and remembered in that browser until you clear it from the field. A wrong passphrase, or a failed save, puts the checkbox back and says why.

## Deploying the site

Pushing to `master` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pages must use **Source: GitHub Actions**.

The workflow builds the catalog, runs both test suites, then publishes `dist/` with a `CNAME` of `grindsheet.maskedsyntax.com`.

DNS for `maskedsyntax.com`:

- `CNAME` `grindsheet` → `maskedsyntax.github.io`

Then set the custom domain in the repo's Pages settings and turn HTTPS on.

## Licence

MIT. See [LICENSE](LICENSE).
