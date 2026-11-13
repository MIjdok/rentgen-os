import fs from "node:fs";

const root = new URL("./", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const list = (dir, ext) => fs.readdirSync(new URL(dir, root)).filter((f) => f.endsWith(ext)).sort().map((f) => dir + f);

const guard = (name, text) => {
  if (/<\/script/i.test(text)) throw new Error(`${name} содержит </script`);
  return text;
};
const json = (path) => JSON.stringify(JSON.parse(read(path))).replace(/<\//g, "<\\/");

const css = [read("./src/os.css"), read("./src/mission.css"), read("./src/apps.css")].join("\n");
const data = [
  `<script id="mission-data" type="application/json">${json("./mission-content.json")}</script>`,
  `<script id="practice-data" type="application/json">${json("./mission-practice.json")}</script>`,
  `<script>\n${guard("project.js", read("./src/project.js"))}</script>`,
  `<script>\n${guard("reply-provider.js", read("./src/reply-provider.js"))}</script>`
].join("\n");
const app = list("./src/os/", ".js").map((f) => guard(f, read(f))).join("\n");

const fill = (html, token, value) => {
  if (!html.includes(token)) throw new Error(`в shell.html нет ${token}`);
  return html.replace(token, () => value);
};

let html = read("./src/shell.html");
html = fill(html, "@@CSS@@", css);
html = fill(html, "@@DATA@@", data);
html = fill(html, "@@APP@@", app);

for (const out of ["./index.html", "./rentgen-os.html"]) fs.writeFileSync(new URL(out, root), html);
console.log(`index.html + rentgen-os.html · ${(html.length / 1024).toFixed(0)} КБ`);
