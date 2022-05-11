import { Module } from '@nestjs/common';
import { bracketsRepositoryProvider } from '../../infrastructure/repositories/providers/brackets.repository.provider';
import { BracketsService } from './brackets.service';
import { BracketsController } from './brackets.controller';
import { PrismaService } from '../../infrastructure/services/prisma.service';

@Module({
  providers: [bracketsRepositoryProvider, PrismaService, BracketsService],
  controllers: [BracketsController],
})
export class BracketsModule {}
