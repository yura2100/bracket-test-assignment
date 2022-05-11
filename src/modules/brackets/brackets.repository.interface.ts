import { Bracket } from '../../core/bracket/bracket';
import { PlayerId } from '../../core/player';
import { BracketId, BracketSize } from '../../core/bracket/types';

export interface IBracketsRepository {
  findById(bracketId: BracketId): Promise<Bracket | null>;

  findNotStarted(
    playerId: PlayerId,
    size: BracketSize,
  ): Promise<Bracket | null>;

  save(bracket: Bracket): Promise<void>;
}
