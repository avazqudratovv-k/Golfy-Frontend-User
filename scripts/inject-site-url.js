// After `react-scripts build`: fill the absolute site URL into og:image / og:url / canonical.
// URL comes from REACT_APP_SITE_URL (environment or .env). When it is unset the tags stay relative
// and the og:url / canonical tags are dropped. Nothing is deployed or contacted.
const fs = require("fs");
const path = require("path");

const readEnvFile = (file) => {
  try {
    const line = fs.readFileSync(file, "utf8").split(/\r?\n/).find((l) => l.startsWith("REACT_APP_SITE_URL="));
    return line ? line.slice("REACT_APP_SITE_URL=".length).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
};

const root = path.join(__dirname, "..");
const site = (process.env.REACT_APP_SITE_URL || readEnvFile(path.join(root, ".env.production")) || readEnvFile(path.join(root, ".env")))
  .replace(/\/+$/, "");
const file = path.join(root, "build", "index.html");
let html = fs.readFileSync(file, "utf8");
if (!site) {
  html = html.replace(/<meta property="og:url"[^>]*>/g, "").replace(/<link rel="canonical"[^>]*>/g, "");
}
html = html.split("__SITE_URL__").join(site);
fs.writeFileSync(file, html);
console.log(site ? `Site URL set to ${site}` : "REACT_APP_SITE_URL not set: og:image stays relative, og:url/canonical removed.");
