import { Module } from '@nestjs/common';
import { BracketsModule } from './modules/brackets/brackets.module';

@Module({
  imports: [BracketsModule],
})
export class AppModule {}
