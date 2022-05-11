import { Match } from './match';
import { PlayerId } from '../player';
import { MatchId, Score } from './types';

type MatchProps = {
  scores?: [PlayerId, Score][];
  nextMatch?: Match | null;
  id?: MatchId;
};

export class MatchFactory {
  static create(props: MatchProps): Match {
    const { scores = [], nextMatch = null, id } = props;
    return new Match(scores, nextMatch, id);
  }
}
