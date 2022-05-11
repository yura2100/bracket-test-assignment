import { MatchId, MatchScores, MatchStatus, Score } from '../match';
import { PlayerId } from '../player';

export type MatchProps = {
  id: MatchId;
  previousLeftMatchId: MatchId | null;
  previousRightMatchId: MatchId | null;
  scores: [PlayerId, Score][];
};

export type MatchResponse = {
  id: MatchId;
  scores: MatchScores;
  winnerId: PlayerId | null;
  status: MatchStatus;
  previousLeftMatch: MatchResponse | null;
  previousRightMatch: MatchResponse | null;
};
