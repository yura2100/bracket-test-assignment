import { randomUUID } from 'crypto';

export abstract class Entity {
  readonly id: string;

  protected constructor(id?: string) {
    this.id = id || randomUUID();
  }

  equals(entity: Entity): boolean {
    return this.id === entity.id;
  }
}
