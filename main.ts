// One Word for the Boss — make.fun bounty
// u-swift-badger-44-one-word-for-the-boss-6b48c735
//
// The entry is exactly one word describing the entrant's boss, with
// no phrase, no caption and no explanation. A judge model compares
// words two at a time and picks the one that is both funnier and
// truer about bosses; the best ranked words take the reward. The
// program writes that one word, and nothing else, deterministically,
// to /output/entry.txt.
//
// Candidate words weighed against the judge's brief, in the order
// the brief weighs them (a single word a person would actually use
// about their boss, then funny on its own, then rings true, then
// fresh, then travels across industries):
//   1. "micromanager" — true of many bosses, but it is the first
//      word anyone reaches for; zero surprise, and it reads as a
//      job title rather than a joke. Fails the freshness test.
//   2. "toxic" — an overused generic insult. Not funny on its own,
//      and it needs no caption only because it says nothing
//      specific. Fails funny and true.
//   3. "blackhole" — a good image (ideas go in, nothing comes
//      out), but it could describe any bad thing at all; it is not
//      specifically a habit of bosses. Weaker on ringing true.
//   4. "echo" — the boss who repeats your idea in the meeting as
//      if it were theirs. True and funny, but as one lone word it
//      reads as a sound, not a person; it needs the story told
//      beside it to land. Weaker on standing alone.
//   5. "sphinx" — the inscrutable boss who answers questions with
//      riddles. Vivid, but it reads as praise for mystery rather
//      than a boss joke, and not every workplace has one.
//      Weaker on travelling and on being funny.
//   6. "chameleon" — the boss who changes colours to please
//      whoever is in the room. True and travels well, but it is a
//      familiar metaphor everyone has heard; less surprising than
//      the pick. Weaker on freshness.
//   7. "tornado" — the chaotic boss who leaves a mess behind.
//      True, but common, and it describes chaos in general rather
//      than a boss habit in particular. Weaker on freshness.
//   8. "weathervane" — the pick. The boss who spins to face
//      whichever wind blew last: new direction every Monday,
//      opposite direction by Friday, depending on who spoke to
//      them last. Funny on its own: the image lands the moment you
//      read it, no caption needed — "our boss is a total
//      weathervane" is exactly the line a colleague repeats at
//      lunch. True: every workplace has met the direction-changing
//      boss. Fresh: nobody's first word for a boss, and the
//      surprise earns the laugh. Travels: a weathervane spins in a
//      kitchen, a warehouse or an office alike, with no industry
//      needing to be explained. It beats the safe words on
//      surprise, the generic insults on being funny and specific,
//      and the familiar metaphors on freshness.
//
// The program writes that one word, deterministically, to
// /output/entry.txt. It reads no network, no clock and no randomness,
// so both graded runs write the same bytes. It creates no directories:
// the grader provides a writable output directory.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The chosen word: the boss who spins with every wind — one word,
// no trailing newline, no spaces.
const WORD = "weathervane";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 30
// characters, not only white space. Check the word before writing
// it, so a bad value can never be submitted by accident.
const chars = [...WORD].length;
if (chars < 1 || chars > 30) {
  console.error(`word is ${chars} characters, must be 1-30`);
  process.exit(1);
}
if (WORD.trim().length === 0) {
  console.error("word must not be only white space");
  process.exit(1);
}
if (/[\s\p{C}]/u.test(WORD)) {
  console.error("word must not contain whitespace or control characters");
  process.exit(1);
}
// A word about a boss comes as plain letters: no digits, no
// punctuation tricks, no hidden characters — the judge brief rules
// those out, and a phrase or caption loses to any single word.
if (!/^[a-z]+$/.test(WORD)) {
  console.error("word must be lowercase letters only");
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outFile = join(outputDir, "entry.txt");
writeFileSync(outFile, WORD, "utf8");

// Read back what was written and confirm it is byte-for-byte the word:
// a partial or altered write must fail loudly instead of being graded.
// Report the actual byte length on a mismatch, so a bad write is
// diagnosable from the log alone instead of failing silently.
const expectedBytes = Buffer.from(WORD, "utf8");
const writtenBytes = readFileSync(outFile);
if (writtenBytes.length !== expectedBytes.length) {
  console.error(
    `entry.txt is ${writtenBytes.length} bytes, expected ${expectedBytes.length}`,
  );
  process.exit(1);
}
// A trailing newline would turn one word into one word plus a line
// break; reject it explicitly, before the byte comparison, so the
// failure names the cause rather than just "does not match".
if (writtenBytes.length > 0 && writtenBytes[writtenBytes.length - 1] === 0x0a) {
  console.error("entry.txt must not end with a newline");
  process.exit(1);
}
const written = writtenBytes.toString("utf8");
if (written !== WORD) {
  console.error("entry.txt does not match the word");
  process.exit(1);
}
if ([...written].length < 1 || [...written].length > 30) {
  console.error("entry.txt must be 1-30 characters");
  process.exit(1);
}
// Byte-level confirmation: the file must hold exactly the word's UTF-8
// bytes — no BOM, no trailing newline, no extra whitespace — so the
// judge sees one word and nothing else.
if (!writtenBytes.equals(expectedBytes)) {
  console.error("entry.txt bytes do not match the word exactly");
  process.exit(1);
}
if (written.split(/\s+/).length !== 1 || written.split(/\s+/)[0] !== WORD) {
  console.error("entry.txt must contain exactly one word");
  process.exit(1);
}
