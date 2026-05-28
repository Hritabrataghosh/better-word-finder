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
 * Build indexes for fast lookup
 * Returns:
 * - ending3: { "ing": ["sing", "king", "walking", ...] }
 * - ending4: { "ring": ["string", "wring", ...] }
 */
export function buildIndexes(words) {
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

  return { ending3, ending4 };
}

/**
 * Check if a SPECIFIC word is a 3-letter trap
 * Word is a trap if ALL OTHER words with same 3-letter ending 
 * are at least 3 letters longer than the ending itself
 */
export function isTrap3(word, ending3Index) {
  if (word.length < 5) return false;
  
  const ending = word.slice(-3);
  const wordsWithEnding = ending3Index[ending] || [];
  
  // Must have at least 1 OTHER word (opponent must have a move)
  const otherWords = wordsWithEnding.filter(w => w !== word);
  if (otherWords.length === 0) return false;
  
  // All other words must be at least 3+ letters longer than ending (3+3=6)
  const minLen = 3 + 3; // ending length + 3
  return otherWords.every(w => w.length >= minLen);
}

/**
 * Check if a SPECIFIC word is a 4-letter trap
 */
export function isTrap4(word, ending4Index) {
  if (word.length < 6) return false;
  
  const ending = word.slice(-4);
  const wordsWithEnding = ending4Index[ending] || [];
  
  const otherWords = wordsWithEnding.filter(w => w !== word);
  if (otherWords.length === 0) return false;
  
  const minLen = 4 + 3; // ending length + 3 = 7
  return otherWords.every(w => w.length >= minLen);
}

/**
 * Get spam words - grouped by endings with actual words
 * Returns diverse endings (mix of 3-letter and 4-letter)
 */
export function getSpamGroups(filteredWords, maxPerGroup = 20, minCount = 10) {
  const endingMap = {};
  
  // Collect 3-letter endings
  for (const word of filteredWords) {
    if (word.length >= 5) {
      const e = word.slice(-3);
      if (!endingMap[e]) endingMap[e] = { ending: e, words: [], len: 3 };
      endingMap[e].words.push(word);
    }
  }
  
  // Collect 4-letter endings  
  for (const word of filteredWords) {
    if (word.length >= 6) {
      const e = word.slice(-4);
      if (!endingMap[e]) endingMap[e] = { ending: e, words: [], len: 4 };
      endingMap[e].words.push(word);
    }
  }

  // Filter to frequent ones, sort by count, take top 20 diverse ones
  const groups = Object.values(endingMap)
    .filter(g => g.words.length >= minCount)
    .sort((a, b) => b.words.length - a.words.length)
    .slice(0, 25) // Get top 25
    .map(g => ({
      ending: g.ending,
      words: shuffleArray(g.words).slice(0, maxPerGroup),
      count: g.words.length,
      is4Letter: g.len === 4
    }));

  // Shuffle groups for variety (so not always "ing" first)
  return shuffleArray(groups).slice(0, 20);
}