import { IsPositive, IsUUID } from 'class-validator';
import { PlayerId } from '../../../core/player';

export class SubmitScoreDto {
  @IsUUID(4)
  readonly playerId!: PlayerId;

  @IsPositive()
  readonly score!: number;
}
