import { Inject, Injectable } from '@nestjs/common';
import { IBracketsRepository } from './brackets.repository.interface';
import { BracketFactory } from '../../core/bracket/bracket-factory';
import { BRACKETS_REPOSITORY_TOKEN } from '../../infrastructure/repositories/providers/brackets.repository.provider';
import {
  BracketId,
  BracketResponse,
  BracketSize,
} from '../../core/bracket/types';
import { PlayerId } from '../../core/player';
import { BracketNotFoundException } from './exceptions/bracket-not-found.exception';

@Injectable()
export class BracketsService {
  constructor(
    @Inject(BRACKETS_REPOSITORY_TOKEN)
    private readonly bracketsRepository: IBracketsRepository,
  ) {}

  async findById(bracketId: BracketId): Promise<BracketResponse> {
    const bracket = await this.bracketsRepository.findById(bracketId);
    if (!bracket) {
      throw new BracketNotFoundException();
    }

    return bracket.toJSON();
  }

  async join(playerId: PlayerId, size: BracketSize): Promise<void> {
    let bracket = await this.bracketsRepository.findNotStarted(playerId, size);
    if (!bracket) {
      bracket = BracketFactory.create({ size });
    }
    bracket.join(playerId);
    await this.bracketsRepository.save(bracket);
  }

  async submitScore(
    bracketId: BracketId,
    playerId: PlayerId,
    score: number,
  ): Promise<void> {
    const bracket = await this.bracketsRepository.findById(bracketId);
    if (!bracket) {
      throw new BracketNotFoundException();
    }

    bracket.submitScore(playerId, score);
    await this.bracketsRepository.save(bracket);
  }
}
