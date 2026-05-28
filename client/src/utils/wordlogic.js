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
  const wordsSet = new Set(words);
  
  // Index: ending -> all words with that ending
  const ending3 = {}; // 3-letter endings
  const ending4 = {}; // 4-letter endings
  
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
  // Trap = ALL words with this ending (except itself) are at least 3+ letters longer than ending
  const trap3Endings = new Set(); // Set of trap endings (e.g., "ats")
  const trap4Endings = new Set(); // Set of trap endings (e.g., "yats")

  for (const [ending, wordList] of Object.entries(ending3)) {
    const minLen = ending.length + 3; // 3 + 3 = 6
    // Check if ALL words with this ending are long enough
    // (We don't exclude any word here because the ending itself doesn't have an "excluded" word)
    // The check is: can opponent play a SHORT word with this ending?
    if (wordList.length > 0 && wordList.every(w => w.length >= minLen)) {
      trap3Endings.add(ending);
    }
  }

  for (const [ending, wordList] of Object.entries(ending4)) {
    const minLen = ending.length + 3; // 4 + 3 = 7
    if (wordList.length > 0 && wordList.every(w => w.length >= minLen)) {
      trap4Endings.add(ending);
    }
  }

  return { wordsSet, ending3, ending4, trap3Endings, trap4Endings };
}

/**
 * Check if a specific word is a trap (for filtered results)
 * A word is a 3-trap if its last 3 letters form a trap ending
 * A word is a 4-trap if its last 4 letters form a trap ending
 */
export function getWordTraps(word, trap3Endings, trap4Endings) {
  const traps = { t3: false, t4: false };
  
  if (word.length >= 5) {
    const e3 = word.slice(-3);
    traps.t3 = trap3Endings.has(e3);
  }
  
  if (word.length >= 6) {
    const e4 = word.slice(-4);
    traps.t4 = trap4Endings.has(e4);
  }
  
  return traps;
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
    .slice(0, 20); // Max 20 spam groups
}