import { copyPreOrderForest, getValueByIndex, PreOrderForest, removeNode, removeSubtree } from './forest';
import { getTreeNodeValue, setTreeNodeValue } from './node';

export const map =
  <T>(forest: PreOrderForest<T>) =>
  <B>(fn: (value: T, index: number, forest: PreOrderForest<T>) => B): PreOrderForest<B> =>
    forest.map((node, index, forest) => setTreeNodeValue(node)(fn(getTreeNodeValue(node), index, forest)));

export const findIndex =
  <T>(forest: PreOrderForest<T>) =>
  (fn: (value: T, index: number, forest: PreOrderForest<T>) => boolean): number =>
    forest.findIndex((node, index, forest) => fn(getTreeNodeValue(node), index, forest));

export const trimFilter =
  <T>(forest: PreOrderForest<T>) =>
  (fn: (value: T, index: number, forest: PreOrderForest<T>) => boolean): PreOrderForest<T> => {
    let newForest: PreOrderForest<T> = copyPreOrderForest(forest);
    let index = 0;
    while (index < newForest.length) {
      const value = getValueByIndex(newForest)(index);
      const passFilter = fn(value, index, newForest);
      if (passFilter) {
        index++;
      } else {
        newForest = removeSubtree(newForest)(index);
      }
    }
    return newForest;
  };

export const filter =
  <T>(forest: PreOrderForest<T>) =>
  (fn: (value: T, index: number, forest: PreOrderForest<T>) => boolean): PreOrderForest<T> => {
    let newForest: PreOrderForest<T> = copyPreOrderForest(forest);
    let index = 0;
    while (index < newForest.length) {
      const value = getValueByIndex(newForest)(index);
      const passFilter = fn(value, index, newForest);
      if (passFilter) {
        index++;
      } else {
        newForest = removeNode(newForest)(index);
      }
    }
    return newForest;
  };
