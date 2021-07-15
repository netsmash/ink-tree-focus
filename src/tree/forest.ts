import {
  addTreeNodeLevel,
  copyTreeNode,
  createTreeNode,
  getTreeNodeLength,
  getTreeNodeLevel,
  getTreeNodeValue,
  TreeNode,
} from './node';
import { Id } from './utils';

export type PreOrderForest<T> = TreeNode<T>[];
export const copyPreOrderForest = <T>(forest: PreOrderForest<T>): PreOrderForest<T> => forest.map(copyTreeNode);
export const createPreOrderForest = <T>(
  values: T[],
  options: {} | { levels: number[] } | { lengths: number[] } | { children: number[] } = {},
): PreOrderForest<T> => {
  // Base and edge cases
  if (!('levels' in options) && !('lengths' in options) && !('children' in options)) {
    return values.map(createTreeNode);
  } else if (values.length === 0) {
    return [];
  } else if ('levels' in options && options.levels.length !== values.length) {
    throw Error('Option `levels` has to be an array with same length as values');
  } else if ('lengths' in options && options.lengths.length !== values.length) {
    throw Error('Option `lengths` has to be an array with same length as values');
  } else if ('children' in options && options.children.length !== values.length) {
    throw Error('Option `children` has to be an array with same length as values');
  }

  // fun cases

  if ('levels' in options) {
    const levels = options.levels;
    if (levels[0] !== 0) {
      throw Error('In preorder, levels array should start by 0');
    }

    const forest = createPreOrderForest(values);
    const ancestorsIndexes: number[] = [];

    for (let i = 0, lastLevel = -1; i < forest.length; i++, lastLevel = levels[i - 1]) {
      if (lastLevel < levels[i] - 1) {
        throw Error('In preorder, descendant consecutive levels should increase in 1.');
      } else if (lastLevel < levels[i]) {
        // add 1 to ancestors length
        ancestorsIndexes.forEach((ancestorIndex) => forest[ancestorIndex].length++);
      } else {
        // remove ancestors until this level
        ancestorsIndexes.splice(levels[i]);
        // add 1 to ancestors length
        ancestorsIndexes.forEach((ancestorIndex) => forest[ancestorIndex].length++);
      }
      // put this node as an ancestor of the next one
      ancestorsIndexes.push(i);
      forest[i].level = levels[i];
    }
    return forest;
  } else if ('lengths' in options) {
    const lengths = options.lengths;
    const forest = createPreOrderForest(values);

    for (let i = 0; i < forest.length; i++) {
      if (lengths[i] < 1) {
        throw Error('In preorder, length of a level should be at least 1');
      }
      for (let j = i + 1; j < i + lengths[i]; j++) {
        // Add one level to all nodes below
        forest[j].level++;
      }
      forest[i].length = lengths[i];
    }
    return forest;
  } else if ('children' in options) {
    const children = options.children;

    // Don't you find the following algorithm fascinating?
    const lengths: number[] = children.map((_) => 1);
    for (let i = children.length - 1; i >= 0; i--) {
      for (let l = 0; l < children[i]; l++) {
        lengths[i] += lengths[i + lengths[i]];
      }
    }

    return createPreOrderForest(values, { lengths });
  }
  return [];
};

export const byIndex =
  <T, R>(
    fn: (node: TreeNode<T>, index: number, forest: PreOrderForest<T>) => R,
  ): ((forest: PreOrderForest<T>) => (index: number) => R) =>
  (forest: PreOrderForest<T>) =>
  (index: number): R =>
    fn(forest[index], index, forest);

export const getNodeByIndex = byIndex(Id);
export const getValueByIndex = byIndex(getTreeNodeValue);
export const getLevelByIndex = byIndex(getTreeNodeLevel);
export const getLengthByIndex = byIndex(getTreeNodeLength);

export const getChildrenIndexes =
  <T>(forest: PreOrderForest<T>) =>
  (index: number): number[] => {
    const getLength = getLengthByIndex(forest);
    const children = [];
    const subtreeLength = index < 0 ? forest.length + 1 : getLength(index);
    for (let i = index + 1; i < index + subtreeLength; i += getLength(i)) {
      children.push(i);
    }
    return children;
  };

export const getParentIndex =
  <T>(tree: PreOrderForest<T>) =>
  (index: number): number => {
    const getLevel = getLevelByIndex(tree);
    const level = getLevel(index);
    while (index > 0) {
      if (getLevel(index - 1) === level - 1) {
        return index - 1;
      }
      index--;
    }
    return index - 1;
  };

export const getAncestorsIndexes =
  <T>(forest: PreOrderForest<T>) =>
  (index: number): number[] => {
    const getLevel = getLevelByIndex(forest);
    const indexes = [];
    let lastLevel = getLevel(index);

    while (index > 0 && lastLevel > 0) {
      if (getLevel(index - 1) < lastLevel) {
        indexes.unshift(index - 1);
        lastLevel = getLevel(index - 1);
      }
      index--;
    }
    return indexes;
  };

export const upSubtree =
  <T>(forest: PreOrderForest<T>) =>
  (index: number) =>
  (levelStep: number): PreOrderForest<T> => {
    const targetLevel = getLevelByIndex(forest)(index) - levelStep;
    if (targetLevel < 0) {
      throw Error(`Could not up a subtree above root level.`);
    }
    const newForest = copyPreOrderForest<T>(forest);
    const getLevel = getLevelByIndex(newForest);
    const getLength = getLengthByIndex(newForest);

    const subtreeLength = getLength(index);

    // get ancestors's indexes
    const ancestorsIndexes = getAncestorsIndexes(newForest)(index);

    // update levels of the subtree
    for (let i = index; i < index + subtreeLength; i++) {
      newForest[index].level -= levelStep;
    }

    // update lengths of old ancestors which aren't no more ancestors
    ancestorsIndexes.splice(targetLevel).forEach((ancestorIndex) => (newForest[ancestorIndex].length -= subtreeLength));

    return newForest;
  };

export const getSubtree =
  <T>(forest: PreOrderForest<T>) =>
  (index: number): PreOrderForest<T> => {
    if (index < 0) {
      return copyPreOrderForest(forest);
    }
    const getLength = getLengthByIndex(forest);
    const getLevel = getLevelByIndex(forest);
    return forest.slice(index, index + getLength(index)).map((N) => addTreeNodeLevel(N)(-getLevel(index)));
  };

export const addSubtree =
  <T>(forest: PreOrderForest<T>) =>
  (parentIndex: number) =>
  (subtree: PreOrderForest<T>, front: boolean = false): PreOrderForest<T> => {
    const newForest = copyPreOrderForest<T>(forest);
    const getLength = getLengthByIndex(newForest);
    const getLevel = getLevelByIndex(newForest);

    // get level and length of the parent, if any
    const parentLevel = parentIndex >= 0 ? getLevel(parentIndex) : -1;

    // move subtree levels above them
    const newSubtree = subtree.map((_) => addTreeNodeLevel(_)(parentLevel + 1));

    // get the index of the subtree
    const subtreeIndex =
      parentIndex >= 0 ? parentIndex + (front ? 1 : getLength(parentIndex)) : front ? 0 : newForest.length;
    newForest.splice(subtreeIndex, 0, ...newSubtree);

    // update length of subtree ancestor's
    const ancestorsIndexes = getAncestorsIndexes(newForest)(subtreeIndex);
    ancestorsIndexes.forEach((ancestorIndex) => {
      newForest[ancestorIndex].length += newSubtree.length;
    });
    return newForest;
  };

export const removeSubtree =
  <T>(forest: PreOrderForest<T>) =>
  (index: number): PreOrderForest<T> => {
    const newForest = copyPreOrderForest<T>(forest);
    const getLength = getLengthByIndex(newForest);

    const length = getLength(index);

    // remove its length from ancestor's length
    getAncestorsIndexes(newForest)(index).forEach((ancestorIndex) => {
      newForest[ancestorIndex].length -= length;
    });

    // remove subtree
    newForest.splice(index, length);
    return newForest;
  };

export const removeDescendants =
  <T>(forest: PreOrderForest<T>) =>
  (index: number): PreOrderForest<T> => {
    const newForest = copyPreOrderForest<T>(forest);
    const getLength = getLengthByIndex(newForest);

    const length = getLength(index);

    // remove its length from ancestor's length
    getAncestorsIndexes(newForest)(index).forEach((ancestorIndex) => {
      newForest[ancestorIndex].length -= length - 1;
    });

    // remove subtree
    newForest.splice(index + 1, length - 1);

    // set own length to 1
    newForest[index].length = 1;

    return newForest;
  };

export const removeNode =
  <T>(forest: PreOrderForest<T>) =>
  (index: number): PreOrderForest<T> => {
    const newForest = copyPreOrderForest<T>(forest);
    const getLength = getLengthByIndex(newForest);

    // up one level it's childs
    for (let i = index + 1; i < index + getLength(index); i++) {
      newForest[i].level--;
    }

    // remove it from ancestor's length
    getAncestorsIndexes(newForest)(index).forEach((ancestorIndex) => {
      newForest[ancestorIndex].length--;
    });

    // remove node
    newForest.splice(index, 1);
    return newForest;
  };
