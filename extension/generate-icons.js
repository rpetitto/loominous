/**
 * Simple script to generate placeholder PNG icons using Canvas API.
 * Run in Node.js: node generate-icons.js
 * Requires: npm install canvas
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#7c3aed');
  grad.addColorStop(1, '#4f46e5');
  ctx.fillStyle = grad;
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Sparkle ✨
  ctx.font = `${Math.floor(size * 0.6)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✨', size / 2, size / 2);

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'icons', `icon${size}.png`), buf);
  console.log(`Generated icon${size}.png`);
}
