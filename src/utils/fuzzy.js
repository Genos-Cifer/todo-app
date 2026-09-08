// Subsequence fuzzy matcher used by the command palette: every query character
// must appear in order, with bonuses for consecutive hits and word starts so
// "ntk" ranks "New task" above an incidental match elsewhere.
//
// Returns { score, indices } (indices = matched positions, for highlighting)
// or null when the text doesn't match at all.
export function fuzzyMatch(query, text) {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, "");
  if (!normalizedQuery) return { score: 0, indices: [] };

  const haystack = text.toLowerCase();
  const indices = [];
  let cursor = 0;
  let score = 0;
  let previousMatch = -2;

  for (const char of normalizedQuery) {
    let matchIndex = -1;
    while (cursor < haystack.length) {
      if (haystack[cursor] === char) { matchIndex = cursor; break; }
      cursor++;
    }
    if (matchIndex === -1) return null;

    let charScore = 1;
    if (matchIndex === previousMatch + 1) charScore += 5;
    if (matchIndex === 0) charScore += 8;
    else if (/[\s\-_/.:]/.test(haystack[matchIndex - 1])) charScore += 6;

    score += charScore;
    indices.push(matchIndex);
    previousMatch = matchIndex;
    cursor++;
  }

  // Nudge shorter texts up so a tight match beats a sprawling one.
  return { score: score - text.length * 0.05, indices };
}

// Splits `text` into { chunk, matched } segments from fuzzyMatch indices,
// so the palette can bold exactly the characters that matched.
export function highlightSegments(text, indices) {
  if (!indices || indices.length === 0) return [{ chunk: text, matched: false }];

  const matchedPositions = new Set(indices);
  const segments = [];
  let buffer = "";
  let bufferMatched = matchedPositions.has(0);

  for (let i = 0; i < text.length; i++) {
    const isMatched = matchedPositions.has(i);
    if (isMatched !== bufferMatched) {
      if (buffer) segments.push({ chunk: buffer, matched: bufferMatched });
      buffer = "";
      bufferMatched = isMatched;
    }
    buffer += text[i];
  }
  if (buffer) segments.push({ chunk: buffer, matched: bufferMatched });
  return segments;
}
