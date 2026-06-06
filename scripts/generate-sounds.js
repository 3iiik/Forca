/* Generate real ambient sound WAV files */
const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const bitDepth = 16;
const channels = 2;
const duration = 30; // 30 seconds, will loop

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const dataLength = numSamples * channels * (bitDepth / 8);
  const buffer = Buffer.alloc(44 + dataLength);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitDepth / 8), 28);
  buffer.writeUInt16LE(channels * (bitDepth / 8), 32);
  buffer.writeUInt16LE(bitDepth, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < channels; ch++) {
      const sample = Math.max(-1, Math.min(1, samples[i][ch] || 0));
      buffer.writeInt16LE(Math.round(sample * 32767), offset);
      offset += 2;
    }
  }

  fs.writeFileSync(filePath, buffer);
  console.log(`  Created ${path.basename(filePath)} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

function generateWhiteNoise() {
  const len = sampleRate * duration;
  const samples = new Array(len);
  for (let i = 0; i < len; i++) {
    const v = (Math.random() * 2 - 1) * 0.15;
    samples[i] = [v, v];
  }
  return samples;
}

function generatePinkNoise() {
  const len = sampleRate * duration;
  const samples = new Array(len);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    const v = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
    samples[i] = [v * 0.2, v * 0.2];
  }
  return samples;
}

function generateBrownNoise() {
  const len = sampleRate * duration;
  const samples = new Array(len);
  let v = 0;
  for (let i = 0; i < len; i++) {
    v += (Math.random() * 2 - 1) * 0.35;
    if (v > 1) v = 1;
    if (v < -1) v = -1;
    samples[i] = [v * 0.25, v * 0.25];
  }
  return samples;
}

function generateForest() {
  const len = sampleRate * duration;
  const samples = new Array(len);

  // Pre-generate bird chirp events
  const chirps = [];
  let t = 0;
  while (t < duration - 0.5) {
    t += 0.5 + Math.random() * 4;
    if (t < duration - 0.2) {
      chirps.push({
        time: t,
        freq: 1500 + Math.random() * 2500,
        length: 0.04 + Math.random() * 0.1,
      });
    }
  }

  let brown = 0;
  for (let i = 0; i < len; i++) {
    const time = i / sampleRate;
    brown += (Math.random() * 2 - 1) * 0.3;
    if (brown > 1) brown = 1;
    if (brown < -1) brown = -1;

    let v = brown * 0.2;
    const wind = Math.sin(2 * Math.PI * 0.1 * time) * 0.5 + 0.5;
    v *= 0.6 + wind * 0.4;

    // Add bird chirps
    for (const chirp of chirps) {
      const dt = time - chirp.time;
      if (dt >= 0 && dt <= chirp.length) {
        const ce = Math.sin(Math.PI * dt / chirp.length);
        const cm = Math.sin(2 * Math.PI * 20 * dt) * 400;
        v += Math.sin(2 * Math.PI * (chirp.freq + cm) * dt) * ce * 0.12;
      }
    }

    // Random cricket/tick sounds
    if (Math.random() < 0.0005) {
      v += 0.08;
    }

    samples[i] = [v * 0.5, v * 0.5];
  }
  return samples;
}

console.log('Generating ambient sound files...\n');

const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
fs.mkdirSync(soundsDir, { recursive: true });

const sounds = [
  { name: 'rain', gen: generatePinkNoise },
  { name: 'white-noise', gen: generateWhiteNoise },
  { name: 'forest', gen: generateForest },
];

for (const s of sounds) {
  console.log(`  ${s.name}...`);
  writeWav(path.join(soundsDir, `${s.name}.wav`), s.gen());
}

// Update useAudio.ts to point to .wav files
const hookPath = path.join(__dirname, '..', 'src', 'renderer', 'hooks', 'useAudio.ts');
let hookContent = fs.readFileSync(hookPath, 'utf-8');
hookContent = hookContent.replace(/\.mp3/g, '.wav');
fs.writeFileSync(hookPath, hookContent);
console.log('\n  Updated useAudio.ts to use .wav files');

console.log('\nDone!');
