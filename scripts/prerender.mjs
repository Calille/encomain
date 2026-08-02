/**
 * Post-build prerender for marketing routes only.
 *
 * Starts vite preview against dist/, renders each marketing route with
 * Puppeteer, and writes the resulting HTML into dist at the correct path
 * so Vercel can serve static HTML to crawlers. Authed and token routes
 * are intentionally excluded and keep the SPA shell via vercel.json.
 */
import { spawn, execSync } from "node:child_process";
import { copyFile, mkdir, writeFile, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const PREVIEW_PORT = 4173;
const PREVIEW_ORIGIN = `http://127.0.0.1:${PREVIEW_PORT}`;

const MARKETING_ROUTES = [
  "/",
  "/services",
  "/pricing",
  "/about",
  "/contact",
  "/careers",
];

function routeToFilePaths(route) {
  if (route === "/") return [path.join(distDir, "index.html")];
  const cleaned = route.replace(/^\//, "").replace(/\/$/, "");
  // Write both directory and flat forms so /services and /services/ work
  // on Vercel (cleanUrls) and common static previews.
  return [
    path.join(distDir, cleaned, "index.html"),
    path.join(distDir, `${cleaned}.html`),
  ];
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok || response.status === 404) return;
    } catch {
      // preview not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Preview server did not start within ${timeoutMs}ms`);
}

function startPreview() {
  const child = spawn(
    "npx",
    ["vite", "preview", "--host", "127.0.0.1", "--port", String(PREVIEW_PORT), "--strictPort"],
    {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: { ...process.env },
    }
  );

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  return {
    child,
    getOutput: () => output,
  };
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  const url = `${PREVIEW_ORIGIN}${route}`;

  await page.setUserAgent(
    "Mozilla/5.0 (compatible; EnclosurePrerender/1.0; +https://theenclosure.co.uk)"
  );

  await page.goto(url, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });

  // Wait until React has painted meaningful marketing content
  await page.waitForFunction(
    () => {
      const root = document.getElementById("root");
      if (!root) return false;
      const text = (root.textContent || "").replace(/\s+/g, " ").trim();
      return text.length > 200 && !!root.querySelector("h1, h2, main");
    },
    { timeout: 30000 }
  );

  // Allow short client effects (titles/meta) to settle
  await new Promise((resolve) => setTimeout(resolve, 500));

  const html = await page.content();
  await page.close();

  const outPaths = routeToFilePaths(route);
  let size = 0;
  for (const outPath of outPaths) {
    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");
    size = (await stat(outPath)).size;
    console.log(`  prerendered ${route} -> ${path.relative(rootDir, outPath)} (${size} bytes)`);
  }
  return size;
}

async function main() {
  const shellPath = path.join(distDir, "index.html");
  const spaShellPath = path.join(distDir, "spa.html");
  const shellHtml = await readFile(shellPath, "utf8");
  const shellSize = Buffer.byteLength(shellHtml, "utf8");

  // Preserve the empty SPA shell for authed / dynamic routes (Vercel catch-all).
  await copyFile(shellPath, spaShellPath);
  console.log(`SPA shell saved to dist/spa.html: ${shellSize} bytes`);
  console.log(`Home dist/index.html before prerender: ${shellSize} bytes`);

  const { child, getOutput } = startPreview();

  try {
    await waitForServer(PREVIEW_ORIGIN);
    console.log(`Preview ready at ${PREVIEW_ORIGIN}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      console.log("Prerendering marketing routes...");
      for (const route of MARKETING_ROUTES) {
        await prerenderRoute(browser, route);
      }
    } finally {
      await browser.close();
    }

    const homeAfter = (await stat(shellPath)).size;
    const spaAfter = (await stat(spaShellPath)).size;
    console.log(`Home dist/index.html after prerender: ${homeAfter} bytes (was ${shellSize})`);
    console.log(`SPA fallback dist/spa.html: ${spaAfter} bytes`);
  } catch (error) {
    console.error("Prerender failed.");
    console.error(getOutput());
    throw error;
  } finally {
    await stopPreview(child);
  }
}

function stopPreview(child) {
  return new Promise((resolve) => {
    if (!child.pid) {
      resolve();
      return;
    }

    const done = () => resolve();
    child.once("exit", done);

    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: "ignore" });
      } else {
        child.kill("SIGTERM");
        setTimeout(() => {
          if (!child.killed) child.kill("SIGKILL");
        }, 1000);
      }
    } catch {
      // process already gone
    }

    // Resolve even if exit event was missed
    setTimeout(done, 1500);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
