import { BracketStatus } from './bracket-status';
import { PlayerId } from '../player';
import { MatchResponse } from '../match-tree';

export type BracketId = string;

export type BracketSize = 8 | 16;

export type BracketResponse = {
  id: BracketId;
  status: BracketStatus;
  maxPlayers: BracketSize;
  players: PlayerId[];
  rootMatch: MatchResponse;
};
