import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const CATEGORIES = {
  feature: { emoji: '✨', label: 'New Features', prefixes: ['feat', 'feature'] },
  fix: { emoji: '🛠', label: 'Fixes', prefixes: ['fix', 'bug', 'hotfix', 'patch'] },
  perf: { emoji: '⚡', label: 'Performance Improvements', prefixes: ['perf', 'performance', 'optimize', 'speed'] },
  ui: { emoji: '🎨', label: 'UI', prefixes: ['ui', 'ux', 'style', 'css', 'design'] },
  infra: { emoji: '🔧', label: 'Infrastructure', prefixes: ['chore', 'refactor', 'ci', 'build', 'test', 'docs', 'deps'] },
};

function classifyCommit(message) {
  const lower = message.toLowerCase().trim();
  for (const [category, config] of Object.entries(CATEGORIES)) {
    for (const prefix of config.prefixes) {
      if (lower.startsWith(`${prefix}:`) || lower.startsWith(`(${prefix})`) || lower.startsWith(`[${prefix}]`)) {
        return category;
      }
    }
  }
  return 'feature';
}

function formatTitle(message) {
  return message
    .replace(/^(feat|feature|fix|bug|hotfix|patch|perf|performance|optimize|speed|ui|ux|style|css|design|chore|refactor|ci|build|test|docs|deps)\s*[:/\-]\s*/i, '')
    .replace(/^\(.*?\)\s*/, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim();
}

function humanizeMessage(message) {
  const title = formatTitle(message);
  if (!title) return message.trim();

  let humanized = title.charAt(0).toUpperCase() + title.slice(1);

  const replacements = [
    [/\badd(s|ed)?\b/i, 'Added'],
    [/\bfix(es|ed)?\b/i, 'Fixed'],
    [/\bremove(s|d)?\b/i, 'Removed'],
    [/\bupdate(s|d)?\b/i, 'Updated'],
    [/\bimprov(e|es|ed)\b/i, 'Improved'],
    [/\brefactor(ed|s)?\b/i, 'Refactored'],
    [/\bimplemen(ts|ted)\b/i, 'Implemented'],
    [/\bbump(s|ed)?\b/i, 'Bumped'],
    [/\bmigrate(s|d)?\b/i, 'Migrated'],
    [/\brevert(s|ed)?\b/i, 'Reverted'],
    [/\bmerg(e|es|ed)\b/i, 'Merged'],
  ];

  for (const [pattern, replacement] of replacements) {
    humanized = humanized.replace(pattern, replacement);
  }

  humanized = humanized.replace(/\b(\w+)\b/g, (word) => {
    if (['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word.toLowerCase()) && word !== word.toUpperCase()) {
      return word;
    }
    return word;
  });

  humanized = humanized.charAt(0).toUpperCase() + humanized.slice(1);
  if (!humanized.endsWith('.')) humanized += '.';

  return humanized;
}

function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { cwd: root, encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

function getPreviousTag(currentTag) {
  try {
    const tags = execSync('git tag --sort=-version:refname', { cwd: root, encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(t => t && t !== currentTag && /^v\d+\.\d+\.\d+/.test(t));
    return tags.length > 0 ? tags[0] : null;
  } catch {
    return null;
  }
}

function getCommits(fromTag, toTag = 'HEAD') {
  if (!fromTag) return [];
  try {
    const range = `${fromTag}..${toTag}`;
    const output = execSync(`git log ${range} --oneline --no-merges`, { cwd: root, encoding: 'utf-8' }).trim();
    if (!output) return [];
    return output.split('\n').map(line => {
      const match = line.match(/^([a-f0-9]+)\s+(.*)/);
      return match
        ? { hash: match[1], message: match[2] }
        : { hash: '', message: line };
    });
  } catch {
    return [];
  }
}

function generateChangelog(fromTag, toTag) {
  const tagFrom = fromTag || getPreviousTag(toTag);
  const tagTo = toTag || getLatestTag();

  const commits = getCommits(tagFrom, tagTo);
  const categorized = {};
  for (const [key] of Object.entries(CATEGORIES)) {
    categorized[key] = [];
  }

  for (const commit of commits) {
    const category = classifyCommit(commit.message);
    const humanized = humanizeMessage(commit.message);
    categorized[category].push(humanized);
  }

  const summary = [];
  for (const [key, config] of Object.entries(CATEGORIES)) {
    if (categorized[key].length > 0) {
      summary.push({ category: key, emoji: config.emoji, label: config.label, items: categorized[key] });
    }
  }

  return {
    version: tagTo,
    fromTag: tagFrom,
    toTag: tagTo,
    commitCount: commits.length,
    categories: summary,
    rawCommits: commits,
  };
}

function printChangelog(changelog) {
  console.log(JSON.stringify(changelog, null, 2));
}

function getArgs() {
  const args = process.argv.slice(2);
  let fromTag = null;
  let toTag = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) {
      fromTag = args[i + 1];
      i++;
    } else if (args[i] === '--to' && args[i + 1]) {
      toTag = args[i + 1];
      i++;
    } else if (!fromTag && !toTag) {
      if (!toTag) {
        toTag = args[i];
      }
    }
  }

  return { fromTag, toTag };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { fromTag, toTag } = getArgs();
  const changelog = generateChangelog(fromTag, toTag);
  printChangelog(changelog);
}

export { generateChangelog, classifyCommit, humanizeMessage, getPreviousTag, getLatestTag, getCommits };
