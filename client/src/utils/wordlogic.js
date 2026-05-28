/**
 * Fisher-Yates shuffle
 */
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build prefix indexes for fast trap detection
 * prefix3: { "ank": ["ankle", "anklet", ...] }
 * prefix4: { "lyly": ["lylyra", ...] }
 */
export function buildIndexes(words) {
  const prefix3 = {};
  const prefix4 = {};

  for (const word of words) {
    if (word.length >= 3) {
      const p = word.slice(0, 3);
      if (!prefix3[p]) prefix3[p] = [];
      prefix3[p].push(word);
    }
    if (word.length >= 4) {
      const p = word.slice(0, 4);
      if (!prefix4[p]) prefix4[p] = [];
      prefix4[p].push(word);
    }
  }

  return { prefix3, prefix4 };
}

/**
 * Check if ending is a TRAP
 * Ending E is a trap if ALL words STARTING with E are at least 2+ letters longer than E
 * AND there is at least 1 such word (opponent has a move)
 */
export function isTrapEnding(prefixIndex, ending) {
  const endingLen = ending.length;
  const minSafe = endingLen + 2;
  
  // Find ALL words STARTING with this ending (opponent's options)
  const solves = prefixIndex[ending] || [];
  
  // Must have at least 1 solve (opponent must be able to move)
  if (solves.length === 0) {
    return false; // Dead end, not a trap
  }
  
  // TRAP = ALL opponent options are at least 2+ letters longer than ending
  return solves.every(w => w.length >= minSafe);
}

/**
 * Get spam words grouped by endings
 */
export function getSpamGroups(filteredWords, maxPerGroup = 20, minCount = 10) {
  const endingMap = {};
  
  for (const word of filteredWords) {
    if (word.length >= 5) {
      const e3 = word.slice(-3);
      if (!endingMap[e3]) endingMap[e3] = { ending: e3, words: [], len: 3 };
      endingMap[e3].words.push(word);
    }
    if (word.length >= 6) {
      const e4 = word.slice(-4);
      if (!endingMap[e4]) endingMap[e4] = { ending: e4, words: [], len: 4 };
      endingMap[e4].words.push(word);
    }
  }

  const groups = Object.values(endingMap)
    .filter(g => g.words.length >= minCount)
    .sort((a, b) => b.words.length - a.words.length)
    .slice(0, 25)
    .map(g => ({
      ending: g.ending,
      words: shuffleArray(g.words).slice(0, maxPerGroup),
      count: g.words.length,
      is4Letter: g.len === 4
    }));

  return shuffleArray(groups).slice(0, 20);
}