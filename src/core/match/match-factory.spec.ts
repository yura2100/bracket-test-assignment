import { randomUUID } from 'crypto';
import { MatchFactory } from './match-factory';
import { PlayerId } from '../player';
import { Score } from './types';

describe('MatchFactory', () => {
  it('should create new match', () => {
    const match = MatchFactory.create({});
    expect(match.id).toBeDefined();
  });

  it('should restore match', () => {
    const firstPlayerId = randomUUID();
    const secondPlayerId = randomUUID();
    const scores = [
      [firstPlayerId, 100],
      [secondPlayerId, null],
    ] as [PlayerId, Score][];
    const match = MatchFactory.create({ id: randomUUID(), scores });
    expect(match.scores[firstPlayerId]).toEqual(100);
  });
});
