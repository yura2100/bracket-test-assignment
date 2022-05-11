import { randomUUID } from 'crypto';
import { MatchStatus } from './match-status';
import { PlayerId } from '../player';
import { Score } from './types';
import { Match } from './match';

describe('Match', () => {
  it('should get match status (not started)', () => {
    const match = new Match([], null);
    expect(match.status).toEqual(MatchStatus.NotStarted);
  });

  it('should get match status (started)', () => {
    const scores = [
      [randomUUID(), null],
      [randomUUID(), 100],
    ] as [PlayerId, Score][];
    const match = new Match(scores, null);
    expect(match.status).toEqual(MatchStatus.Started);
  });

  it('should get match status (finished)', () => {
    const scores = [
      [randomUUID(), 200],
      [randomUUID(), 100],
    ] as [PlayerId, Score][];
    const match = new Match(scores, null);
    expect(match.status).toEqual(MatchStatus.Finished);
  });

  it('should get winnerId', () => {
    const firstPlayerId = randomUUID();
    const secondPlayerId = randomUUID();
    const scores = [
      [firstPlayerId, 100],
      [secondPlayerId, 200],
    ] as [PlayerId, Score][];
    const match = new Match(scores, null);
    expect(match.winnerId).toEqual(secondPlayerId);
  });

  it('should not get winnerId when match not finished', () => {
    const firstPlayerId = randomUUID();
    const secondPlayerId = randomUUID();
    const scores = [
      [firstPlayerId, 100],
      [secondPlayerId, null],
    ] as [PlayerId, Score][];
    const match = new Match(scores, null);
    expect(match.winnerId).toEqual(null);
  });

  it('should add new player to match with empty scores', () => {
    const match = new Match([], null);
    const playerId = randomUUID();
    match.addPlayer(playerId);

    const scores = match.scores;
    expect(scores[playerId]).toEqual(null);
  });

  it('should not add new player to match (match is started)', () => {
    const match = new Match([], null);
    match.addPlayer(randomUUID());
    match.addPlayer(randomUUID());

    expect(() => match.addPlayer(randomUUID())).toThrow(
      'This match is already started',
    );
  });

  it('should not add new player to match (player already added)', () => {
    const match = new Match([], null);
    const playerId = randomUUID();
    match.addPlayer(playerId);

    expect(() => match.addPlayer(playerId)).toThrow(
      'This player is already added',
    );
  });

  it('should add scores by player id', () => {
    const match = new Match([], null);
    match.addPlayer(randomUUID());
    const playerId = randomUUID();
    match.addPlayer(playerId);
    match.addScore(playerId, 100);

    const scores = match.scores;
    expect(scores[playerId]).toEqual(100);
  });

  it('should not add scores by playerId (match is not started)', () => {
    const match = new Match([], null);

    expect(() => match.addScore(randomUUID(), 100)).toThrow(
      'This match did not started yet',
    );
  });

  it('should not add scores by playerId (player does not belong)', () => {
    const match = new Match([], null);
    match.addPlayer(randomUUID());
    match.addPlayer(randomUUID());

    expect(() => match.addScore(randomUUID(), 100)).toThrow(
      'This player does not belong to this match',
    );
  });

  it('should not add scores by playerId (player already submitted scores)', () => {
    const firstPlayerId = randomUUID();
    const secondPlayerId = randomUUID();
    const scores = [
      [firstPlayerId, 100],
      [secondPlayerId, null],
    ] as [PlayerId, Score][];
    const match = new Match(scores, null);

    expect(() => match.addScore(firstPlayerId, 200)).toThrow(
      'This player already submitted scores',
    );
  });

  it('should add winner to next match', () => {
    const nextMatch = new Match([], null);
    const currentMatch = new Match([], nextMatch);
    const firstPlayerId = randomUUID();
    const secondPlayerId = randomUUID();
    currentMatch.addPlayer(firstPlayerId);
    currentMatch.addPlayer(secondPlayerId);
    currentMatch.addScore(firstPlayerId, 100);
    currentMatch.addScore(secondPlayerId, 200);

    expect(nextMatch.scores[secondPlayerId]).toEqual(null);
  });
});
