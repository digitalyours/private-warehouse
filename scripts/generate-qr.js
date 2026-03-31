#!/usr/bin/env node
'use strict';

const QRCode = require('qrcode');
const fs     = require('fs');
const path   = require('path');

const OWNER     = 'digitalyours';
const REPO      = 'private-warehouse';
const PAGE_URL  = `https://${OWNER}.github.io/${REPO}`;
const NUM_BOXES = 10;

const outDir = 'qr-codes';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const boxes = Array.from({length: NUM_BOXES}, (_, i) =>
  `BOX-${String(i + 1).padStart(3, '0')}`
);

function readLabel(boxId) {
  try {
    const md = fs.readFileSync(`boxes/${boxId}.md`, 'utf8');
    const m  = md.match(/\*\*Label:\*\*\s*(.+)/);
    return m ? m[1].trim() : '';
  } catch {
    return '';
  }
}

async function main() {
  console.log(`Generiere ${NUM_BOXES} QR-Codes ...`);

  // 1. PNG-Datei pro Box
  await Promise.all(boxes.map(async (boxId) => {
    const url  = `${PAGE_URL}/?box=${boxId}`;
    const file = path.join(outDir, `${boxId}.png`);
    await QRCode.toFile(file, url, {
      width: 400,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    console.log(`  OK ${boxId}.png`);
  }));

  // 2. Druckbare HTML-Seite
  const cards = boxes.map(boxId => {
    const label = readLabel(boxId);
    const labelHtml = label ? `<div class="box-lbl">${label}</div>` : '';
    return [
      '<div class="card">',
      `  <img src="${boxId}.png" alt="${boxId}">`,
      `  <div class="box-id">${boxId}</div>`,
      `  ${labelHtml}`,
      '</div>'
    ].join('\n    ');
  }).join('\n\n    ');

  const html = [
    '<!DOCTYPE html>',
    '<html lang="de">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>QR-Codes - Lagerverwaltung</title>',
    '  <style>',
    '    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
    '    body { font-family: -apple-system, sans-serif; padding: 24px; background: #f8fafc; }',
    '    h1 { font-size: 20px; margin-bottom: 6px; }',
    '    p  { font-size: 13px; color: #64748b; margin-bottom: 24px; }',
    '    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }',
    '    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; break-inside: avoid; }',
    '    .card img { width: 120px; height: 120px; display: block; margin: 0 auto 10px; }',
    '    .box-id  { font-size: 14px; font-weight: 700; color: #1e293b; }',
    '    .box-lbl { font-size: 12px; color: #64748b; margin-top: 3px; }',
    '    @media print {',
    '      body { padding: 10px; background: white; }',
    '      p, h1 { display: none; }',
    '      .grid { grid-template-columns: repeat(4, 1fr); gap: 12px; }',
    '      .card { border: 1px solid #ccc; padding: 10px; }',
    '      .card img { width: 110px; height: 110px; }',
    '    }',
    '  </style>',
    '</head>',
    '<body>',
    '  <h1>Lagerverwaltung - QR-Codes</h1>',
    '  <p>Strg+P / Cmd+P zum Drucken. QR-Codes auf die Euroboxen kleben.</p>',
    '  <div class="grid">',
    `    ${cards}`,
    '  </div>',
    '</body>',
    '</html>'
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  console.log('  OK index.html (Druckseite)');
  console.log('Fertig!');
}

main().catch(e => { console.error(e); process.exit(1); });
