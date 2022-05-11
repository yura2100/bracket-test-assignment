import { NotFoundException } from '@nestjs/common';

export class BracketNotFoundException extends NotFoundException {
  constructor() {
    super('Bracket Not Found');
  }
}
