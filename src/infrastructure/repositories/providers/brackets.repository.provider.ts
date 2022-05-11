import { ClassProvider } from '@nestjs/common';
import { IBracketsRepository } from '../../../modules/brackets/brackets.repository.interface';
import { PrismaBracketsRepository } from '../prisma/brackets.repository';

export const BRACKETS_REPOSITORY_TOKEN = Symbol('BRACKETS_REPOSITORY_TOKEN');

export const bracketsRepositoryProvider: ClassProvider<IBracketsRepository> = {
  provide: BRACKETS_REPOSITORY_TOKEN,
  useClass: PrismaBracketsRepository,
};
