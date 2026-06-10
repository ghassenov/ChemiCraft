import reactionsData from '../data/reactions.json';

export function solveReaction(reactants) {
  const sorted = [...reactants].sort();
  for (const reaction of reactionsData) {
    const expected = [...reaction.reactants].sort();
    if (sorted.length === expected.length && sorted.every((r, i) => r === expected[i])) {
      return reaction;
    }
  }
  return null;
}
