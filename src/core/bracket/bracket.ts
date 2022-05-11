import { Entity } from '../entity';
import { PlayerId } from '../player';
import { MatchTree } from '../match-tree/match-tree';
import { BracketStatus } from './bracket-status';
import { MatchStatus } from '../match';
import { BracketId, BracketResponse } from './types';
import { DomainException } from '../domain.exception';

export class Bracket extends Entity {
  private readonly players: Set<PlayerId>;
  private readonly matchTree: MatchTree;

  constructor(players: PlayerId[], matchTree: MatchTree, id?: BracketId) {
    super(id);
    this.players = new Set(players);
    this.matchTree = matchTree;
  }

  private get status(): BracketStatus {
    if (this.matchTree.getEmptyMatch()) {
      return BracketStatus.NotStarted;
    } else if (this.matchTree.isFinished()) {
      return BracketStatus.Finished;
    }

    return BracketStatus.Started;
  }

  join(playerId: PlayerId): void {
    if (this.players.has(playerId)) {
      throw new DomainException('This player already joined');
    }

    const match = this.matchTree.getEmptyMatch();
    if (!match) {
      throw new DomainException('This bracket already started');
    }

    match.addPlayer(playerId);
    this.players.add(playerId);
  }

  submitScore(playerId: PlayerId, score: number): void {
    if (!this.players.has(playerId)) {
      throw new DomainException('This player does not belong to this bracket');
    }

    const match = this.matchTree.getLastPlayersMatch(playerId);
    if (!match || match.status !== MatchStatus.Started) {
      throw new DomainException('Can not submit scores for this bracket');
    }

    match.addScore(playerId, score);
  }

  toJSON(): BracketResponse {
    return {
      id: this.id,
      status: this.status,
      maxPlayers: this.matchTree.maxPlayers,
      players: Array.from(this.players.values()),
      rootMatch: this.matchTree.toJSON(),
    };
  }
}
