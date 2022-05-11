import { Injectable } from '@nestjs/common';
import {
  Bracket,
  BracketParticipant,
  BracketStatus,
  Match,
  MatchScore,
  Prisma,
} from '@prisma/client';
import { IBracketsRepository } from '../../../modules/brackets/brackets.repository.interface';
import { Bracket as BracketM } from '../../../core/bracket/bracket';
import { BracketFactory as BracketFactoryM } from '../../../core/bracket/bracket-factory';
import { PrismaService } from '../../services/prisma.service';
import {
  BracketId,
  BracketResponse,
  BracketSize,
} from '../../../core/bracket/types';
import { PlayerId } from '../../../core/player';
import { MatchResponse } from '../../../core/match-tree';

type RawBracket = Bracket & {
  participants: BracketParticipant[];
  matches: (Match & {
    scores: MatchScore[];
  })[];
};

@Injectable()
export class PrismaBracketsRepository implements IBracketsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private toDomain(rawBracket: RawBracket): BracketM {
    const id = rawBracket.id;
    const size = rawBracket.maxPlayers as BracketSize;
    const players = rawBracket.participants.map(({ playerId }) => playerId);
    const matches = rawBracket.matches.map((match) => ({
      id: match.id,
      previousLeftMatchId: match.previousLeftMatchId,
      previousRightMatchId: match.previousRightMatchId,
      scores: match.scores.map(({ playerId, score }) => [
        playerId,
        score,
      ]) as any,
    }));
    return BracketFactoryM.create({ id, size, players, matches });
  }

  async findById(bracketId: BracketId): Promise<BracketM | null> {
    const rawBracket = await this.prismaService.bracket.findUnique({
      include: {
        participants: true,
        matches: { include: { scores: true } },
      },
      where: { id: bracketId },
    });

    if (!rawBracket) {
      return null;
    }
    return this.toDomain(rawBracket);
  }

  async findNotStarted(
    playerId: PlayerId,
    size: BracketSize,
  ): Promise<BracketM | null> {
    const rawBracket = await this.prismaService.bracket.findFirst({
      include: {
        participants: true,
        matches: { include: { scores: true } },
      },
      where: {
        status: BracketStatus.NOT_STARTED,
        maxPlayers: size,
        participants: { none: { playerId } },
      },
    });

    if (!rawBracket) {
      return null;
    }
    return this.toDomain(rawBracket);
  }

  private *postOrderMatches(match: MatchResponse): Generator<MatchResponse> {
    if (match.previousLeftMatch) {
      yield* this.postOrderMatches(match.previousLeftMatch);
    }
    if (match.previousRightMatch) {
      yield* this.postOrderMatches(match.previousRightMatch);
    }
    yield match;
  }

  private makeCreate({
    status,
    maxPlayers,
    players,
    rootMatch,
  }: BracketResponse): Prisma.BracketCreateInput {
    const participants = players.map((playerId) => ({ playerId }));
    const matches = Array.from(this.postOrderMatches(rootMatch));
    const createMatches = matches.map((match) => {
      const scoresEntries = Object.entries(match.scores);
      const createScores = Array.from(scoresEntries).map(
        ([playerId, score]) => ({ playerId, score }),
      );
      return {
        id: match.id,
        previousLeftMatchId: match.previousLeftMatch?.id ?? null,
        previousRightMatchId: match.previousRightMatch?.id ?? null,
        scores: { create: createScores },
      };
    });

    return {
      status,
      maxPlayers,
      participants: { create: participants },
      matches: { create: createMatches },
    };
  }

  private makeUpdate({
    status,
    maxPlayers,
    players,
    rootMatch,
  }: BracketResponse): Prisma.BracketUpdateInput {
    const participants = players.map((playerId) => ({ playerId }));
    const matches = Array.from(this.postOrderMatches(rootMatch));
    const updateMatches = matches.map((match) => {
      const scoresEntries = Object.entries(match.scores);
      const upsertScores = Array.from(scoresEntries).map(
        ([playerId, score]) => ({
          where: { playerId_matchId: { playerId, matchId: match.id } },
          create: { playerId, score },
          update: { score },
        }),
      );
      return {
        where: { id: match.id },
        data: {
          scores: { upsert: upsertScores },
        },
      };
    });

    return {
      status,
      maxPlayers,
      participants: {
        createMany: { data: participants, skipDuplicates: true },
      },
      matches: { update: updateMatches },
    };
  }

  async save(bracket: BracketM): Promise<void> {
    const rawBracket = bracket.toJSON();

    await this.prismaService.bracket.upsert({
      where: { id: rawBracket.id },
      create: this.makeCreate(rawBracket),
      update: this.makeUpdate(rawBracket),
    });
  }
}
