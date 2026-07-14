import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_OG_DIR = path.join(__dirname, "../public/og");
const PUBLIC_SCREENSHOTS_DIR = path.join(__dirname, "../public/screenshots");

const BASE_URL = "https://mhd-store.vercel.app";

const PAGES = [
  { path: "/", name: "home-desktop", type: "desktop" },
  { path: "/login", name: "login", type: "desktop" },
  { path: "/register", name: "register", type: "desktop" },
  { path: "/custom-development", name: "custom-development", type: "desktop" },
  { path: "/faqs", name: "faqs", type: "desktop" },
  { path: "/support", name: "support", type: "desktop" },
  { path: "/pricing", name: "pricing", type: "desktop" },
];

async function generateScreenshots() {
  // Ensure directories exist
  if (!fs.existsSync(PUBLIC_OG_DIR)) {
    fs.mkdirSync(PUBLIC_OG_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_SCREENSHOTS_DIR)) {
    fs.mkdirSync(PUBLIC_SCREENSHOTS_DIR, { recursive: true });
  }

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const page = await browser.newPage();

  for (const pageConfig of PAGES) {
    console.log(`\nNavigating to ${BASE_URL}${pageConfig.path}...`);
    await page.goto(`${BASE_URL}${pageConfig.path}`, {
      waitUntil: "networkidle0",
    });

    // Wait for animations
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 1. Generate OG Screenshot (1920x1008 maintains 1.9:1 ratio but gives a wider desktop layout)
    console.log(`Capturing OG screenshot: ${pageConfig.name}.png...`);
    await page.setViewport({ width: 1920, height: 1008, deviceScaleFactor: 1 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.screenshot({
      path: path.join(PUBLIC_OG_DIR, `${pageConfig.name}.png`),
      type: "png",
      clip: { x: 0, y: 0, width: 1920, height: 1008 },
    });

    // 2. Generate Manifest Screenshot (1920x1080)
    console.log(
      `Capturing Manifest Desktop screenshot: ${pageConfig.name}.png...`,
    );
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await page.screenshot({
      path: path.join(PUBLIC_SCREENSHOTS_DIR, `${pageConfig.name}.png`),
      type: "png",
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });

    // 3. Generate Mobile Manifest Screenshot for home only
    if (pageConfig.path === "/") {
      console.log(`Capturing Manifest Mobile screenshot: home-mobile.png...`);
      // To get a 1080x2340 output that triggers mobile media queries,
      // we use a 360x780 CSS viewport with a 3x scale factor.
      await page.setViewport({
        width: 360,
        height: 780,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.screenshot({
        path: path.join(PUBLIC_SCREENSHOTS_DIR, `home-mobile.png`),
        type: "png",
        clip: { x: 0, y: 0, width: 360, height: 780 },
      });
    }
  }

  await browser.close();
  console.log("\nScreenshots generated successfully!");
}

generateScreenshots().catch((err) => {
  console.error("Error generating screenshots:", err);
  process.exit(1);
});
