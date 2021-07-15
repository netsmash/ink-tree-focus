import { DOMElement } from 'ink';
import { FocusableItem } from './state';
import { findIndex, getAncestorsIndexes, getSubtree, getTreeNodeValue, getValueByIndex, PreOrderForest } from './tree';

export const copyMap = <K, V>(map: Map<K, V>): Map<K, V> => {
  const newMap = new Map<K, V>();
  map.forEach((value, key) => newMap.set(key, value));
  return newMap;
};

export const isAncestorDOMElement = (child: DOMElement, parent: DOMElement) => {
  for (let element = child.parentNode; element; element = element.parentNode) {
    if (parent === element) {
      return true;
    }
  }
  return false;
};

export const findParentFocusableId = (map: Map<Symbol, FocusableItem>, domElement: DOMElement): Symbol | undefined => {
  for (let parent = domElement.parentNode; parent; parent = parent.parentNode) {
    for (const [index, item] of map.entries()) {
      if (item.domElement === parent) {
        return index;
      }
    }
  }
};

export const getAncestorTreeIds = (forest: PreOrderForest<Symbol>, id?: Symbol): Symbol[] => {
  if (!id) {
    return [];
  }
  const index = findIndex(forest)((nodeId) => nodeId === id);
  if (index < 0) {
    return [];
  }
  return [...getAncestorsIndexes(forest)(index), index].map((index) => forest[index]).map(getTreeNodeValue);
};

export const getActiveId = (activeIds: Symbol[]): Symbol | undefined => activeIds[activeIds.length - 1];

const isFocusableByIndex =
  (focusableItems: Map<Symbol, FocusableItem>) =>
  (forest: PreOrderForest<Symbol>) =>
  (index: number): boolean =>
    focusableItems.get(getValueByIndex(forest)(index))?.focusable || false;

export const isFocusableSubtree =
  (focusableItems: Map<Symbol, FocusableItem>) =>
  (forest: PreOrderForest<Symbol>) =>
  (index: number): boolean =>
    findIndex(getSubtree(forest)(index))((id) => focusableItems.get(id)?.focusable || false) >= 0;

export const getNextIdInForest = (forest: PreOrderForest<Symbol>, currentActiveId?: Symbol): Symbol | undefined => {
  if (forest.length === 0) {
    return undefined;
  }
  const currentActiveIndex = currentActiveId ? findIndex(forest)((id) => id === currentActiveId) : -1;
  const activeIndex = (currentActiveIndex + 1) % forest.length;
  return getValueByIndex(forest)(activeIndex);
};

export const getNextFocusableIdInForest = (
  focusableItems: Map<Symbol, FocusableItem>,
  forest: PreOrderForest<Symbol>,
  currentActiveId?: Symbol,
): Symbol | undefined => {
  // if there are no focusable items we deactivate focus
  if (!isFocusableSubtree(focusableItems)(forest)(-1)) {
    return undefined;
  }

  // get index in forest which is the activeId
  const currentActiveIndex = currentActiveId ? findIndex(forest)((id) => id === currentActiveId) : -1;

  // calcule next active index
  let activeIndex = (currentActiveIndex + 1) % forest.length;
  while (!isFocusableByIndex(focusableItems)(forest)(activeIndex)) {
    activeIndex = (activeIndex + 1) % forest.length;
  }

  // get the corresponding id
  const activeId = getValueByIndex(forest)(activeIndex);
  return activeId;
};

export const getPreviousIdInForest = (forest: PreOrderForest<Symbol>, currentActiveId?: Symbol): Symbol | undefined => {
  if (forest.length === 0) {
    return undefined;
  }
  const currentActiveIndex = Math.max(currentActiveId ? findIndex(forest)((id) => id === currentActiveId) : 1);
  const activeIndex = (currentActiveIndex - 1 + forest.length) % forest.length;
  return getValueByIndex(forest)(activeIndex);
};

export const getPreviousFocusableIdInForest = (
  focusableItems: Map<Symbol, FocusableItem>,
  forest: PreOrderForest<Symbol>,
  currentActiveId?: Symbol,
): Symbol | undefined => {
  // if there are no focusable items we deactivate focus
  if (!isFocusableSubtree(focusableItems)(forest)(-1)) {
    return undefined;
  }

  // get index in forest which is the activeId
  const currentActiveIndex = Math.max(currentActiveId ? findIndex(forest)((id) => id === currentActiveId) : 1);

  // calcule next active index
  let activeIndex = (currentActiveIndex - 1 + forest.length) % forest.length;
  while (!isFocusableByIndex(focusableItems)(forest)(activeIndex)) {
    activeIndex = (activeIndex - 1 + forest.length) % forest.length;
  }

  // get the corresponding id
  const activeId = getValueByIndex(forest)(activeIndex);
  return activeId;
};
