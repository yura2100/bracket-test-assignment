import { Entity } from '../entity';
import { MatchStatus } from './match-status';
import { PlayerId } from '../player';
import { MatchId, MatchScores, Score } from './types';
import { DomainException } from '../domain.exception';

export class Match extends Entity {
  private readonly MAX_PLAYERS = 2;
  private readonly scoresMap: Map<PlayerId, Score>;
  private readonly nextMatch: Match | null;

  constructor(
    scores: [PlayerId, Score][],
    nextMatch: Match | null,
    id?: MatchId,
  ) {
    super(id);
    this.scoresMap = new Map(scores);
    this.nextMatch = nextMatch;
  }

  private isPlayerExists(playerId: PlayerId): boolean {
    return this.scoresMap.has(playerId);
  }

  get status(): MatchStatus {
    if (this.scoresMap.size !== this.MAX_PLAYERS) {
      return MatchStatus.NotStarted;
    }

    for (const score of this.scoresMap.values()) {
      if (!score) {
        return MatchStatus.Started;
      }
    }

    return MatchStatus.Finished;
  }

  get winnerId(): PlayerId | null {
    if (this.status !== MatchStatus.Finished) {
      return null;
    }

    const scores = Array.from(this.scoresMap.entries());
    const [winnerId] = scores.reduce((maxScores, currentScores) => {
      return (maxScores[1] as number) > (currentScores[1] as number)
        ? maxScores
        : currentScores;
    });
    return winnerId;
  }

  get scores(): MatchScores {
    const scoresEntries = this.scoresMap.entries();
    return Object.fromEntries(scoresEntries);
  }

  addPlayer(playerId: PlayerId): void {
    if (this.status === MatchStatus.Started) {
      throw new DomainException('This match is already started');
    }

    if (this.isPlayerExists(playerId)) {
      throw new DomainException('This player is already added');
    }

    this.scoresMap.set(playerId, null);
  }

  addScore(playerId: PlayerId, score: NonNullable<Score>): void {
    if (this.status !== MatchStatus.Started) {
      throw new DomainException('This match did not started yet');
    }

    if (!this.isPlayerExists(playerId)) {
      throw new DomainException('This player does not belong to this match');
    }

    if (this.scoresMap.get(playerId)) {
      throw new DomainException('This player already submitted scores');
    }

    this.scoresMap.set(playerId, score);
    const winnerId = this.winnerId;
    if (winnerId) {
      this.nextMatch?.addPlayer(winnerId);
    }
  }
}
