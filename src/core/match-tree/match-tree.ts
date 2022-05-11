import { MatchTreeNode } from './match-tree-node';
import { Match, MatchStatus } from '../match';
import { BracketSize } from '../bracket/types';
import { PlayerId } from '../player';
import { MatchResponse } from './types';

export class MatchTree {
  readonly maxPlayers: BracketSize;
  private readonly rootMatchNode: MatchTreeNode;

  constructor(maxPlayers: BracketSize, match: MatchTreeNode) {
    this.maxPlayers = maxPlayers;
    this.rootMatchNode = match;
  }

  isFinished(): boolean {
    return this.rootMatchNode.match.winnerId !== null;
  }

  private *preOrderMatches(matchNode = this.rootMatchNode): Generator<Match> {
    yield matchNode.match;
    if (matchNode.previousLeftMatchNode) {
      yield* this.preOrderMatches(matchNode.previousLeftMatchNode);
    }
    if (matchNode.previousRightMatchNode) {
      yield* this.preOrderMatches(matchNode.previousRightMatchNode);
    }
  }

  getEmptyMatch(): Match | null {
    for (const match of this.preOrderMatches()) {
      if (match.status === MatchStatus.NotStarted) {
        return match;
      }
    }

    return null;
  }

  getLastPlayersMatch(playerId: PlayerId): Match | null {
    for (const match of this.preOrderMatches()) {
      if (match.scores[playerId] === null) {
        return match;
      }
    }

    return null;
  }

  private toJSONImpl(matchNode: MatchTreeNode | null): MatchResponse | null {
    if (!matchNode) {
      return null;
    }

    return {
      id: matchNode.match.id,
      scores: matchNode.match.scores,
      winnerId: matchNode.match.winnerId,
      status: matchNode.match.status,
      previousLeftMatch: this.toJSONImpl(matchNode.previousLeftMatchNode),
      previousRightMatch: this.toJSONImpl(matchNode.previousRightMatchNode),
    };
  }

  toJSON(): MatchResponse {
    return this.toJSONImpl(this.rootMatchNode) as MatchResponse;
  }
}
