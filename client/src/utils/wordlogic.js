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
 * Build pre-computed indexes for instant trap detection
 */
export function buildIndexes(words) {
  // Index: ending -> all words with that ending
  const ending3 = {};
  const ending4 = {};

  for (const word of words) {
    if (word.length >= 3) {
      const e = word.slice(-3);
      if (!ending3[e]) ending3[e] = [];
      ending3[e].push(word);
    }
    if (word.length >= 4) {
      const e = word.slice(-4);
      if (!ending4[e]) ending4[e] = [];
      ending4[e].push(word);
    }
  }

  // Pre-compute trap status for each ending
  // Trap = ending has AT LEAST 1 OTHER word, and ALL are at least 3+ letters longer than ending
  const trap3Endings = new Set();
  const trap4Endings = new Set();

  for (const [ending, wordList] of Object.entries(ending3)) {
    const endingLen = ending.length; // 3
    const minSafe = endingLen + 3;   // 6

    // Must have at least 2 words total (so opponent has at least 1 option after you play)
    if (wordList.length >= 2 && wordList.every(w => w.length >= minSafe)) {
      trap3Endings.add(ending);
    }
  }

  for (const [ending, wordList] of Object.entries(ending4)) {
    const endingLen = ending.length; // 4
    const minSafe = endingLen + 3;   // 7

    // Must have at least 2 words total
    if (wordList.length >= 2 && wordList.every(w => w.length >= minSafe)) {
      trap4Endings.add(ending);
    }
  }

  return { trap3Endings, trap4Endings };
}

/**
 * Get spam words grouped by their spam endings
 * Returns actual words that end with frequently-occurring endings
 */
export function getSpamGroups(filteredWords, maxPerGroup = 20, minCount = 15) {
  const endingMap = {};

  // Group by 3-letter and 4-letter endings
  for (const word of filteredWords) {
    if (word.length >= 5) {
      const e3 = word.slice(-3);
      if (!endingMap[e3]) endingMap[e3] = [];
      endingMap[e3].push(word);
    }
    if (word.length >= 6) {
      const e4 = word.slice(-4);
      if (!endingMap[e4]) endingMap[e4] = [];
      endingMap[e4].push(word);
    }
  }

  // Filter to frequent endings, return with actual words
  return Object.entries(endingMap)
    .filter(([_, words]) => words.length >= minCount)
    .map(([ending, words]) => ({
      ending,
      words: shuffleArray(words).slice(0, maxPerGroup),
      count: words.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}