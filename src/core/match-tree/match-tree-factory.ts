import { MatchTree } from './match-tree';
import { BracketSize } from '../bracket/types';
import { MatchProps } from './types';
import { MatchTreeNode } from './match-tree-node';
import { Match, MatchFactory, MatchId } from '../match';

type MatchTreeProps = {
  size: BracketSize;
  matches?: MatchProps[];
};

export class MatchTreeFactory {
  static create({ size, matches }: MatchTreeProps): MatchTree {
    if (matches) {
      return MatchTreeFactory.restore(size, matches);
    }

    const matchNode = this.buildNode(size) as MatchTreeNode;
    return new MatchTree(size, matchNode);
  }

  private static buildNode(
    size: number,
    prevMatchNode?: MatchTreeNode,
  ): MatchTreeNode | null {
    if (size === 1) {
      return null;
    }

    const matchNode = new MatchTreeNode();
    matchNode.match = MatchFactory.create({ nextMatch: prevMatchNode?.match });
    matchNode.previousLeftMatchNode = this.buildNode(size - 1, matchNode);
    matchNode.previousRightMatchNode = this.buildNode(size - 1, matchNode);
    return matchNode;
  }

  private static restore(size: BracketSize, matches: MatchProps[]): MatchTree {
    const rawMatchMap = new Map<MatchId, MatchProps>();
    const matchNodeMap = new Map<MatchId, MatchTreeNode>();
    // Key - previousMatchId, value - nextMatchId
    const nextMatchIdMap = new Map<MatchId, MatchId>();
    for (const match of matches) {
      rawMatchMap.set(match.id, match);
      matchNodeMap.set(match.id, new MatchTreeNode());
      if (match.previousLeftMatchId && match.previousRightMatchId) {
        nextMatchIdMap.set(match.previousLeftMatchId, match.id);
        nextMatchIdMap.set(match.previousRightMatchId, match.id);
      }
    }

    let rootMatchId: MatchId;
    const matchMap = new Map<MatchId, Match>();
    const restoreMatch = ({ id, scores }: MatchProps): Match => {
      const restoredMatch = matchMap.get(id);
      if (restoredMatch) {
        return restoredMatch;
      }

      const nextMatchId = nextMatchIdMap.get(id);
      if (!nextMatchId) {
        const match = MatchFactory.create({ id, scores });
        matchMap.set(id, match);
        rootMatchId = match.id;
        return match;
      }

      const rawNextMatch = rawMatchMap.get(nextMatchId) as MatchProps;
      const nextMatch = restoreMatch(rawNextMatch);
      matchMap.set(nextMatchId, nextMatch);
      const match = MatchFactory.create({ id, scores, nextMatch });
      matchMap.set(id, match);
      return match;
    };

    for (const match of matches) {
      const matchNode = matchNodeMap.get(match.id) as MatchTreeNode;
      matchNode.match = restoreMatch(match);
      matchNode.previousLeftMatchNode = match.previousLeftMatchId
        ? (matchNodeMap.get(match.previousLeftMatchId) as MatchTreeNode)
        : null;
      matchNode.previousRightMatchNode = match.previousRightMatchId
        ? (matchNodeMap.get(match.previousRightMatchId) as MatchTreeNode)
        : null;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const rootMatchNode = matchNodeMap.get(rootMatchId) as MatchTreeNode;
    return new MatchTree(size, rootMatchNode);
  }
}
