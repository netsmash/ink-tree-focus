import {
  PreOrderForest,
  createPreOrderForest,
  getChildrenIndexes,
  upSubtree,
  removeNode,
  getSubtree,
  removeSubtree,
  removeDescendants,
} from './forest';

describe('Test forest basic operations', () => {
  const labels: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const getLevels = <T>(forest: PreOrderForest<T>): number[] => forest.map(({ level }) => level);
  const getLengths = <T>(forest: PreOrderForest<T>): number[] => forest.map(({ length }) => length);
  const getChildren = <T>(forest: PreOrderForest<T>): number[] =>
    forest.map((_, i) => getChildrenIndexes(forest)(i).length);

  test('Create PreOrderForest base case', () => {
    const forest = createPreOrderForest('ABC'.split(''));
    expect(forest).toEqual([
      { value: 'A', level: 0, length: 1 },
      { value: 'B', level: 0, length: 1 },
      { value: 'C', level: 0, length: 1 },
    ]);
  });

  test('Create PreOrderForest by levels', () => {
    const forest = createPreOrderForest('ABCDEFG'.split(''), { levels: [0, 1, 2, 2, 1, 1, 2] });
    expect(forest).toEqual([
      { value: 'A', level: 0, length: 7 },
      { value: 'B', level: 1, length: 3 },
      { value: 'C', level: 2, length: 1 },
      { value: 'D', level: 2, length: 1 },
      { value: 'E', level: 1, length: 1 },
      { value: 'F', level: 1, length: 2 },
      { value: 'G', level: 2, length: 1 },
    ]);
  });

  test('Create PreOrderForest by lengths', () => {
    let forest = createPreOrderForest('ABCDEFG'.split(''), { lengths: [7, 3, 1, 1, 1, 2, 1] });
    expect(forest).toEqual([
      { value: 'A', level: 0, length: 7 },
      { value: 'B', level: 1, length: 3 },
      { value: 'C', level: 2, length: 1 },
      { value: 'D', level: 2, length: 1 },
      { value: 'E', level: 1, length: 1 },
      { value: 'F', level: 1, length: 2 },
      { value: 'G', level: 2, length: 1 },
    ]);

    forest = createPreOrderForest('ABCDEFG'.split(''), { lengths: [3, 1, 1, 3, 2, 1, 1] });
    expect(forest).toEqual([
      { value: 'A', level: 0, length: 3 },
      { value: 'B', level: 1, length: 1 },
      { value: 'C', level: 1, length: 1 },
      { value: 'D', level: 0, length: 3 },
      { value: 'E', level: 1, length: 2 },
      { value: 'F', level: 2, length: 1 },
      { value: 'G', level: 0, length: 1 },
    ]);
  });

  test('Create PreOrderForest by children', () => {
    let forest = createPreOrderForest('ABCDEFG'.split(''), { children: [3, 2, 0, 0, 0, 1, 0] });
    expect(forest).toEqual([
      { value: 'A', level: 0, length: 7 },
      { value: 'B', level: 1, length: 3 },
      { value: 'C', level: 2, length: 1 },
      { value: 'D', level: 2, length: 1 },
      { value: 'E', level: 1, length: 1 },
      { value: 'F', level: 1, length: 2 },
      { value: 'G', level: 2, length: 1 },
    ]);

    forest = createPreOrderForest('ABCDEFG'.split(''), { children: [2, 0, 0, 1, 1, 0, 0] });
    expect(forest).toEqual([
      { value: 'A', level: 0, length: 3 },
      { value: 'B', level: 1, length: 1 },
      { value: 'C', level: 1, length: 1 },
      { value: 'D', level: 0, length: 3 },
      { value: 'E', level: 1, length: 2 },
      { value: 'F', level: 2, length: 1 },
      { value: 'G', level: 0, length: 1 },
    ]);
  });

  test('getChildrenIndexes', () => {
    const levels = [0, 1, 2, 2, 1, 1, 2];
    const forest = createPreOrderForest(
      levels.map((_, i) => labels[i]),
      { levels },
    );
    expect(getChildrenIndexes(forest)(-1)).toEqual([0]);
    expect(getChildrenIndexes(forest)(0)).toEqual([1, 4, 5]);
    expect(getChildrenIndexes(forest)(1)).toEqual([2, 3]);
    expect(getChildrenIndexes(forest)(2)).toEqual([]);
    expect(getChildrenIndexes(forest)(3)).toEqual([]);
    expect(getChildrenIndexes(forest)(4)).toEqual([]);
    expect(getChildrenIndexes(forest)(5)).toEqual([6]);
    expect(getChildrenIndexes(forest)(6)).toEqual([]);
  });

  test('getChildrenIndexes', () => {
    const levels = [0, 1, 2, 2, 0, 1, 2, 3, 1, 2, 0, 0, 0, 1];
    const forest = createPreOrderForest(
      levels.map((_, i) => labels[i]),
      { levels },
    );
    expect(getChildrenIndexes(forest)(-1)).toEqual([0, 4, 10, 11, 12]);
    expect(getChildrenIndexes(forest)(0)).toEqual([1]);
    expect(getChildrenIndexes(forest)(1)).toEqual([2, 3]);
    expect(getChildrenIndexes(forest)(2)).toEqual([]);
    expect(getChildrenIndexes(forest)(3)).toEqual([]);
    expect(getChildrenIndexes(forest)(4)).toEqual([5, 8]);
    expect(getChildrenIndexes(forest)(5)).toEqual([6]);
    expect(getChildrenIndexes(forest)(6)).toEqual([7]);
    expect(getChildrenIndexes(forest)(7)).toEqual([]);
    expect(getChildrenIndexes(forest)(8)).toEqual([9]);
    expect(getChildrenIndexes(forest)(9)).toEqual([]);
    expect(getChildrenIndexes(forest)(10)).toEqual([]);
    expect(getChildrenIndexes(forest)(11)).toEqual([]);
    expect(getChildrenIndexes(forest)(12)).toEqual([13]);
    expect(getChildrenIndexes(forest)(13)).toEqual([]);
  });

  test('upSubtree', () => {
    let forest = createPreOrderForest('ABCDEFG'.split(''), { levels: [0, 1, 2, 2, 1, 1, 2] });
    forest = upSubtree(forest)(3)(1);
    expect(getLevels(forest)).toEqual([0, 1, 2, 1, 1, 1, 2]);
    expect(getLengths(forest)).toEqual([7, 2, 1, 1, 1, 2, 1]);
    expect(getChildren(forest)).toEqual([4, 1, 0, 0, 0, 1, 0]);
  });

  test('removeNode', () => {
    let forest = createPreOrderForest('ABCDEFG'.split(''), { levels: [0, 1, 2, 2, 1, 1, 2] });
    forest = removeNode(forest)(1);
    expect(forest).toEqual([
      { value: 'A', level: 0, length: 6 },
      { value: 'C', level: 1, length: 1 },
      { value: 'D', level: 1, length: 1 },
      { value: 'E', level: 1, length: 1 },
      { value: 'F', level: 1, length: 2 },
      { value: 'G', level: 2, length: 1 },
    ]);
    expect(getChildren(forest)).toEqual([4, 0, 0, 0, 1, 0]);
  });

  test('getSubtree', () => {
    const levels = [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1];
    const forest = createPreOrderForest(
      levels.map((_, i) => labels[i]),
      { levels },
    );
    const subtree = getSubtree(forest)(8);
    expect(getLevels(subtree)).toEqual([0, 1, 1, 1]);
    expect(getLengths(subtree)).toEqual([4, 1, 1, 1]);
    expect(getChildren(subtree)).toEqual([3, 0, 0, 0]);
  });

  test('getSubtree index -1', () => {
    const levels = [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1];
    const forest = createPreOrderForest(
      levels.map((_, i) => labels[i]),
      { levels },
    );
    const subtree = getSubtree(forest)(-1);
    expect(getLevels(subtree)).toEqual(levels);
    expect(getLengths(subtree)).toEqual([8, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1]);
    expect(getChildren(subtree)).toEqual([7, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0]);
  });

  test('removeSubtree', () => {
    const levels = [0, 1, 2, 2, 1, 1, 2];
    const forest = createPreOrderForest(
      levels.map((_, i) => labels[i]),
      { levels },
    );
    const subtree = removeSubtree(forest)(1);
    expect(getLevels(subtree)).toEqual([0, 1, 1, 2]);
    expect(getLengths(subtree)).toEqual([4, 1, 2, 1]);
    expect(getChildren(subtree)).toEqual([2, 0, 1, 0]);
  });

  test('removeDescendants', () => {
    const levels = [0, 1, 2, 2, 1, 1, 2];
    const forest = createPreOrderForest(
      levels.map((_, i) => labels[i]),
      { levels },
    );
    const subtree = removeDescendants(forest)(1);
    expect(getLevels(subtree)).toEqual([0, 1, 1, 1, 2]);
    expect(getLengths(subtree)).toEqual([5, 1, 1, 2, 1]);
    expect(getChildren(subtree)).toEqual([3, 0, 0, 1, 0]);
  });
});
