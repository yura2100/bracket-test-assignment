import { Match } from '../match';

export class MatchTreeNode {
  match!: Match;
  previousLeftMatchNode!: MatchTreeNode | null;
  previousRightMatchNode!: MatchTreeNode | null;
}
