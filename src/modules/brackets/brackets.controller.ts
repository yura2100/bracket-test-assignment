import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { BracketsService } from './brackets.service';
import { JoinBracketDto } from './dto/join-bracket.dto';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { BracketId, BracketResponse } from '../../core/bracket/types';

@Controller('brackets')
export class BracketsController {
  constructor(private readonly bracketsService: BracketsService) {}

  @Get(':bracketId')
  findById(
    @Param('bracketId', ParseUUIDPipe) bracketId: BracketId,
  ): Promise<BracketResponse> {
    return this.bracketsService.findById(bracketId);
  }

  @Post('join')
  join(@Body() dto: JoinBracketDto): Promise<void> {
    const { playerId, size } = dto;
    return this.bracketsService.join(playerId, size);
  }

  @Post('submit/:bracketId')
  submitScore(
    @Param('bracketId', ParseUUIDPipe) bracketId: BracketId,
    @Body() dto: SubmitScoreDto,
  ): Promise<void> {
    const { playerId, score } = dto;
    return this.bracketsService.submitScore(bracketId, playerId, score);
  }
}
