import { PlayerId } from '../player';

export type MatchId = string;

export type Score = number | null;

export type MatchScores = Record<PlayerId, Score>;
