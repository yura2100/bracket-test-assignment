import { IsIn, IsUUID } from 'class-validator';
import { BracketSize } from '../../../core/bracket/types';
import { PlayerId } from '../../../core/player';

export class JoinBracketDto {
  @IsUUID(4)
  readonly playerId!: PlayerId;

  @IsIn([8, 16])
  readonly size!: BracketSize;
}
