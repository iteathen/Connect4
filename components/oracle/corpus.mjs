import fs from 'node:fs';

export function loadSolvedActionCorpus(metaUrl) {
  const meta = JSON.parse(fs.readFileSync(metaUrl, 'utf8'));
  const dataUrl = new URL(meta.dataFile, metaUrl);
  const text = fs.readFileSync(dataUrl, 'utf8').trim();
  const vectors = text.length === 0 ? [] : text.split('\n').map((line, index) => {
    const parts = line.split('\t');
    if (parts.length !== 6) throw new Error(`${meta.dataFile}:${index + 1}: expected 6 tab-separated fields`);
    const sourceLine = Number.parseInt(parts[2], 10);
    const oracleScore = Number.parseInt(parts[4], 10);
    const moveScores = parts[5].split(',').map((value) => Number.parseInt(value, 10));
    if (!Number.isInteger(sourceLine) || !Number.isInteger(oracleScore) || moveScores.length !== 7 || moveScores.some((value) => !Number.isInteger(value))) {
      throw new Error(`${meta.dataFile}:${index + 1}: invalid numeric field`);
    }
    return {
      group: parts[0],
      sourceSet: parts[1],
      sourceLine,
      sequence: parts[3],
      oracleScore,
      moveScores,
    };
  });
  if (vectors.length !== meta.vectorCount) throw new Error(`${meta.dataFile}: expected ${meta.vectorCount} vectors, found ${vectors.length}`);
  return { ...meta, vectors };
}
