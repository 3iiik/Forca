import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const EMBED_COLOR = 0x1D9E75;
const FOOTER_TEXT = 'Built for focused work.';
const THUMBNAIL_URL = 'https://raw.githubusercontent.com/3iiik/Forca/main/assets/icons/icon.png';

function parseVersion(version) {
  const cleaned = version.replace(/^v/, '').split('-')[0];
  const parts = cleaned.split('.').map(Number);
  return { major: parts[0] || 0, minor: parts[1] || 0, patch: parts[2] || 0 };
}

function getMention(version) {
  const { major, minor, patch } = parseVersion(version);
  if (major >= 3) return '@everyone';
  if (patch > 0) return null;
  return '@here';
}

function truncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen - 3) + '...';
}

function buildDownloadField(downloads) {
  if (!downloads || downloads.length === 0) {
    return 'Available on [GitHub Releases]($RELEASE_URL)';
  }

  const lines = [];
  for (const dl of downloads) {
    if (dl.name && dl.url) {
      const label = dl.name
        .replace(/^Forca-/i, '')
        .replace(/-x64/i, '')
        .replace(/\.(exe|dmg|AppImage|deb|rpm)$/i, '');
      lines.push(`[${label}](${dl.url})`);
    }
  }

  if (lines.length === 0) return 'Available on [GitHub Releases]($RELEASE_URL)';
  return lines.join(' · ');
}

function buildHighlightText(categories, rawBody) {
  const parts = [];

  for (const cat of categories) {
    if (cat.items.length === 0) continue;
    const items = cat.items.slice(0, 3);
    const itemText = items.map(i => `• ${i}`).join('\n');
    const remaining = cat.items.length - 3;
    const suffix = remaining > 0 ? `\n• *…and ${remaining} more*` : '';
    parts.push(`**${cat.emoji} ${cat.label}**\n${itemText}${suffix}`);
  }

  if (parts.length === 0 && rawBody) {
    const cleaned = rawBody.replace(/^#+\s*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    parts.push(truncate(cleaned, 800));
  }

  return parts.length > 0 ? parts.join('\n\n') : 'No details provided.';
}

function buildContent(version, mention) {
  const v = version.replace(/^v/, '');
  let text = `🚀 **Forca v${v} is now available**`;
  if (mention) {
    text = `${mention} ${text}`;
  }
  return text;
}

function buildEmbed(input) {
  const {
    version,
    releaseName,
    releaseUrl,
    releaseBody,
    changelog,
    downloads,
    timestamp,
  } = input;

  const v = version.replace(/^v/, '');
  const categories = changelog?.categories || [];
  const mention = getMention(version);

  const content = buildContent(version, mention);
  const downloadField = buildDownloadField(downloads);
  const highlights = buildHighlightText(categories, releaseBody);

  const embed = {
    title: `Forca v${v}`,
    url: releaseUrl || `https://github.com/3iiik/Forca/releases/tag/${version}`,
    color: EMBED_COLOR,
    thumbnail: { url: THUMBNAIL_URL },
    fields: [
      { name: 'Version', value: `v${v}`, inline: true },
      { name: 'Downloads', value: downloadField, inline: false },
      { name: '✨ Highlights', value: highlights, inline: false },
    ],
    footer: { text: FOOTER_TEXT },
  };

  if (timestamp) {
    embed.timestamp = timestamp;
  }

  const payload = {
    content: content,
    embeds: [embed],
  };

  return payload;
}

function collectInput() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error(`Invalid JSON input: ${e.message}`));
      }
    });
    process.stdin.on('error', reject);
  });
}

async function main() {
  const input = await collectInput();
  const payload = buildEmbed(input);
  console.log(JSON.stringify(payload, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

export { buildEmbed, buildContent, buildHighlightText, buildDownloadField, getMention, parseVersion };
