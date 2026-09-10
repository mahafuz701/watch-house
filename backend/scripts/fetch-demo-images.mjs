// Fetch realistic watch images from loremflickr (CC-licensed, deterministic via ?lock=N)
// into backend/public/uploads/products so the demo store is fully self-contained.
// Run: node scripts/fetch-demo-images.mjs

import { mkdirSync, existsSync, writeFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/uploads/products");
mkdirSync(outDir, { recursive: true, mode: 0o755 });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadImage(url, dest, attempt = 1) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFileSync(dest, buf);
    return true;
  } catch (err) {
    if (attempt < 4) {
      await sleep(1200 * attempt);
      return downloadImage(url, dest, attempt + 1);
    }
    console.error(`  ✗ failed ${url}: ${err.message}`);
    return false;
  }
}

async function main() {
  const jobs = [];
  // 96 product photos (3 per product × 32 products)
  for (let i = 1; i <= 96; i++) {
    const lock = 10000 + i;
    jobs.push({
      url: `https://loremflickr.com/800/800/watch?lock=${lock}`,
      dest: join(outDir, `prod-${String(i).padStart(2, "0")}.jpg`),
    });
  }
  // brand logos / banners
  for (let i = 1; i <= 8; i++) {
    const lock = 20000 + i;
    jobs.push({
      url: `https://loremflickr.com/400/400/watch,logo?lock=${lock}`,
      dest: join(outDir, `brand-${i}.jpg`),
    });
  }
  // category banners
  for (let i = 1; i <= 8; i++) {
    const lock = 30000 + i;
    jobs.push({
      url: `https://loremflickr.com/900/600/watch?lock=${lock}`,
      dest: join(outDir, `cat-${i}.jpg`),
    });
  }
  // misc (hero / promo / lifestyle)
  for (let i = 1; i <= 8; i++) {
    const lock = 40000 + i;
    jobs.push({
      url: `https://loremflickr.com/1200/1200/watch,man?lock=${lock}`,
      dest: join(outDir, `lifestyle-${i}.jpg`),
    });
  }

  console.log(`Fetching ${jobs.length} demo images → ${outDir}`);
  let ok = 0;
  for (let idx = 0; idx < jobs.length; idx++) {
    if (existsSync(jobs[idx].dest)) { ok++; continue; }
    const success = await downloadImage(jobs[idx].url, jobs[idx].dest);
    if (success) ok++;
    if (idx % 10 === 0) console.log(`  … ${idx + 1}/${jobs.length}`);
    await sleep(150);
  }
  console.log(`Done. ${ok}/${jobs.length} images available locally.`);
}

main();