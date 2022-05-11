import { Bracket } from './bracket';
import { MatchTreeFactory } from '../match-tree/match-tree-factory';
import { BracketId, BracketSize } from './types';
import { PlayerId } from '../player';
import { MatchProps } from '../match-tree';

type BracketProps = {
  size: BracketSize;
  players?: PlayerId[];
  matches?: MatchProps[];
  id?: BracketId;
};

export class BracketFactory {
  static create({ size, players = [], matches, id }: BracketProps): Bracket {
    const matchTree = MatchTreeFactory.create({ size, matches });
    return new Bracket(players, matchTree, id);
  }
}
