import { useMemo, useState, useRef, useCallback } from "react";
import "./App.css";

import { shuffleArray, buildIndexes, isTrapEnding, getSpamGroups } from "./utils/wordlogic";
import rawWords from "./data/words.txt?raw";

const MAX_RESULTS = 20;

function App() {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  // Parse and build prefix indexes ONCE
  const { words, prefix3, prefix4 } = useMemo(() => {
    const parsed = rawWords
      .split(/\r?\n/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length >= 3 && /^[a-z]+$/.test(w));

    const { prefix3, prefix4 } = buildIndexes(parsed);
    return { words: parsed, prefix3, prefix4 };
  }, []);

  // INSTANT search
  const suffixMode = search.startsWith(" ");
  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return [];
    
    let result;
    if (suffixMode) {
      result = words.filter((word) => word.endsWith(query));
    } else {
      result = words.filter((word) => word.startsWith(query));
    }
    
    return shuffleArray(result).slice(0, 400);
  }, [query, suffixMode, words]);

  // Categorize
  const normalSolves = useMemo(() => {
    return filtered
      .filter((w) => w.length <= 9)
      .slice(0, MAX_RESULTS);
  }, [filtered]);

  // 3-LETTER TRAPS: word's last 3 letters are a trap ending
  // Trap = ALL words STARTING with those 3 letters are >= 5 letters long
  const trap3 = useMemo(() => {
    return filtered
      .filter((w) => {
        if (w.length < 5) return false;
        const ending = w.slice(-3);
        return isTrapEnding(prefix3, ending);
      })
      .slice(0, MAX_RESULTS);
  }, [filtered, prefix3]);

  // 4-LETTER TRAPS: word's last 4 letters are a trap ending
  // Trap = ALL words STARTING with those 4 letters are >= 6 letters long
  const trap4 = useMemo(() => {
    return filtered
      .filter((w) => {
        if (w.length < 6) return false;
        const ending = w.slice(-4);
        return isTrapEnding(prefix4, ending);
      })
      .slice(0, MAX_RESULTS);
  }, [filtered, prefix4]);

  const spamGroups = useMemo(() => {
    return getSpamGroups(filtered, 20, 10);
  }, [filtered]);

  // Quick delete
  const handleFocus = useCallback(() => {
    if (search.length > 0) setSearch("");
  }, [search]);

  const handleDoubleClick = useCallback(() => {
    setSearch("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="app">
      <h1>🔍 BETTER WORD FINDER</h1>

      <div className="searchBox">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={handleFocus}
          onDoubleClick={handleDoubleClick}
          placeholder='Search... (" abc" = suffix)  👆 Click-out & in = clear'
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="stats-bar">
        <span>Query: <b>{query || "—"}</b></span>
        <span>Normal: <b>{normalSolves.length}</b></span>
        <span>3L Traps: <b className="t3">{trap3.length}</b></span>
        <span>4L Traps: <b className="t4">{trap4.length}</b></span>
        <span>Spam: <b>{spamGroups.length}</b></span>
      </div>

      <div className="vertical-layout">
        <section className="section normal-section">
          <h2>✅ NORMAL SOLVES <span className="count">({normalSolves.length})</span></h2>
          <div className="word-row">
            {normalSolves.length === 0 ? (
              <span className="empty">No normal solves</span>
            ) : (
              normalSolves.map((word, i) => (
                <span key={i} className="word normal">{word}</span>
              ))
            )}
          </div>
        </section>

        <section className="section trap3-section">
          <h2>⚠️ 3 LETTER TRAPS <span className="count">({trap3.length})</span></h2>
          <div className="word-row">
            {trap3.length === 0 ? (
              <span className="empty">No 3-letter traps</span>
            ) : (
              trap3.map((word, i) => (
                <span key={i} className="word trap3" title={`Trap ending: ${word.slice(-3)} | Opponent must play >= 5 letters`}>
                  {word}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="section trap4-section">
          <h2>🚨 4 LETTER TRAPS <span className="count">({trap4.length})</span></h2>
          <div className="word-row">
            {trap4.length === 0 ? (
              <span className="empty">No 4-letter traps</span>
            ) : (
              trap4.map((word, i) => (
                <span key={i} className="word trap4" title={`Trap ending: ${word.slice(-4)} | Opponent must play >= 6 letters`}>
                  {word}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="section spam-section">
          <h2>📊 SPAM WORDS <span className="count">({spamGroups.length} groups)</span></h2>
          <div className="spam-container">
            {spamGroups.length === 0 ? (
              <span className="empty">No spam patterns</span>
            ) : (
              spamGroups.map((group, gi) => (
                <div key={gi} className="spam-group">
                  <div className="spam-header">
                    <span className="spam-ending">{group.ending}</span>
                    <span className="spam-count">{group.count}x</span>
                    {group.is4Letter && <span className="spam-badge">4L</span>}
                  </div>
                  <div className="spam-words">
                    {group.words.map((word, wi) => (
                      <span key={wi} className="word spam">{word}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;