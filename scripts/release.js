const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const pkg = require("../package.json");
const version = pkg.version;
const ghPath = `C:\\Program Files\\GitHub CLI\\gh.exe`;
const exeFile = `release\\Companion.Writer.Setup.${version}.exe`;
const downloadUrl = `https://github.com/7saval/writingAI/releases/download/v${version}/Companion.Writer.Setup.${version}.exe`;
const headerPath = path.join(__dirname, "../frontend/src/components/common/Header.tsx");

console.log(`\n릴리스 시작: v${version}\n`);

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

// Header.tsx 다운로드 URL 업데이트
const header = fs.readFileSync(headerPath, "utf-8");
const updated = header.replace(
  /href="https:\/\/github\.com\/7saval\/writingAI\/releases\/[^"]+"/,
  `href="${downloadUrl}"`
);
fs.writeFileSync(headerPath, updated, "utf-8");
console.log(`Header.tsx 다운로드 URL → ${downloadUrl}`);

run(`git add frontend/src/components/common/Header.tsx`);
run(`git commit -m "chore: update download URL to v${version}"`);

// GitHub Release 생성 + 파일 업로드
run(
  `"${ghPath}" release create "v${version}" "${exeFile}" "release\\latest.yml" --repo 7saval/writingAI --title "v${version}" --notes "v${version}"`
);

run("git push origin HEAD"); // 태그는 gh release create가 이미 생성함

console.log(`\n✓ v${version} 릴리스 완료\n`);
