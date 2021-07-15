import { DOMElement } from 'ink';
import { Action, ActionType } from './actions';
import { FocusableItem, State } from './state';
import {
  addSubtree,
  createTreeNode,
  findIndex,
  getSubtree,
  removeNode,
  getParentIndex,
  getValueByIndex,
  removeDescendants,
  getChildrenIndexes,
  copyTreeNode,
  copyPreOrderForest,
  removeSubtree,
  getLevelByIndex,
} from './tree';
import {
  copyMap,
  getActiveId,
  getAncestorTreeIds,
  getNextFocusableIdInForest,
  findParentFocusableId,
  getPreviousFocusableIdInForest,
  isAncestorDOMElement,
  isFocusableSubtree,
  getNextIdInForest,
  getPreviousIdInForest,
} from './utils';

export const reducer = (state: State, action: Action): State => {
  /*
   * REGISTER NODE
   */
  if (action.type === ActionType.RegisterNode) {
    const focusable: FocusableItem = {
      id: action.id,
      domElement: action.element,
      focusable: action.focusable,
    };
    const node = createTreeNode(action.id);

    const focusableItems = copyMap(state.focusableItems);
    focusableItems.set(action.id, focusable);

    // search if some new DOMElement's ancestor is in the tree
    const parentId = findParentFocusableId(focusableItems, action.element);
    if (parentId) {
      const parentIndex = findIndex(state.forest)((id) => id === parentId);
      const forest = addSubtree(state.forest)(parentIndex)([node]);

      return { ...state, focusableItems, forest };
    }

    // search root nodes that are a child of the new DOMElement
    let childrenNodeIndexes = getChildrenIndexes(state.forest)(-1)
      .map((index) => ({ index, id: getValueByIndex(state.forest)(index) }))
      .map(({ index, id }) => ({ index, item: state.focusableItems.get(id) as FocusableItem }))
      .map(({ index, item }): { index: number; element: DOMElement } => ({ index, element: item.domElement }))
      .filter(({ element }) => isAncestorDOMElement(element, action.element))
      .map(({ index }) => index);

    if (childrenNodeIndexes.length === 0) {
      // independent tree
      const forest = addSubtree(state.forest)(-1)([node]);
      return { ...state, focusableItems, forest };
    }

    let forest = copyPreOrderForest(state.forest);
    // insert node in the place of the first child
    const nodeIndex = childrenNodeIndexes[0];
    forest.splice(nodeIndex, 0, node);
    // adjust it's childrenNodeIndexes after insertion
    childrenNodeIndexes = childrenNodeIndexes.map((index) => index + 1);
    // put every tree as sub tree of the new node
    childrenNodeIndexes.forEach((index) => {
      const subtree = getSubtree(forest)(index);
      forest = removeSubtree(forest)(index);
      forest = addSubtree(forest)(nodeIndex)(subtree);
    });

    return { ...state, focusableItems, forest };

    /*
     * UNREGISTER NODE
     */
  } else if (action.type === ActionType.UnregisterNode) {
    if (!state.focusableItems.has(action.id)) {
      return state;
    }

    let activeIds = state.activeIds;
    let activeId = getActiveId(state.activeIds);
    // if actual id has the focus, focus previous
    if (action.id === activeId) {
      activeId = getPreviousFocusableIdInForest(state.focusableItems, state.forest, action.id);
      activeIds = getAncestorTreeIds(state.forest, activeId);
    }

    const focusableItems = copyMap(state.focusableItems);
    focusableItems.delete(action.id);

    const itemIndex = findIndex(state.forest)((id) => id === action.id);
    const forest = removeNode(state.forest)(itemIndex);

    return { ...state, focusableItems, forest, activeIds };
    /*
     * FOCUS NEXT
     */
  } else if (action.type === ActionType.FocusNext) {
    const activeId = getNextFocusableIdInForest(state.focusableItems, state.forest, action.id);
    const activeIds = getAncestorTreeIds(state.forest, activeId);
    return { ...state, activeIds };
    /*
     * FOCUS PREV
     */
  } else if (action.type === ActionType.FocusPrev) {
    const activeId = getPreviousFocusableIdInForest(state.focusableItems, state.forest, action.id);
    const activeIds = getAncestorTreeIds(state.forest, activeId);

    return { ...state, activeIds };
    /*
     * FOCUS NEXT CHILD
     */
  } else if (action.type === ActionType.FocusNextChild) {
    const nodeIndex = findIndex(state.forest)((id) => id === action.parentId);
    if (nodeIndex < 0) {
      return state;
    }
    const level = getLevelByIndex(state.forest)(nodeIndex) + 1;
    const leveledActiveId = state.activeIds[level];

    const childrensFilteredTree = getChildrenIndexes(state.forest)(nodeIndex)
      .filter(isFocusableSubtree(state.focusableItems)(state.forest))
      .map(getValueByIndex(state.forest))
      .map(createTreeNode);

    const childId = getNextIdInForest(childrensFilteredTree, leveledActiveId);
    const childIndex = findIndex(state.forest)((id) => id === childId);
    const subtree = getSubtree(state.forest)(childIndex);
    const activeId = getNextFocusableIdInForest(state.focusableItems, subtree);
    const activeIds = getAncestorTreeIds(state.forest, activeId);
    return { ...state, activeIds };
    /*
     * FOCUS PREV CHILD
     */
  } else if (action.type === ActionType.FocusPrevChild) {
    const nodeIndex = findIndex(state.forest)((id) => id === action.parentId);
    if (nodeIndex < 0) {
      return state;
    }
    const level = getLevelByIndex(state.forest)(nodeIndex) + 1;
    const leveledActiveId = state.activeIds[level];

    const childrensFilteredTree = getChildrenIndexes(state.forest)(nodeIndex)
      .filter(isFocusableSubtree(state.focusableItems)(state.forest))
      .map(getValueByIndex(state.forest))
      .map(createTreeNode);

    const childId = getPreviousIdInForest(childrensFilteredTree, leveledActiveId);
    const childIndex = findIndex(state.forest)((id) => id === childId);
    const subtree = getSubtree(state.forest)(childIndex);
    const activeId = getNextFocusableIdInForest(state.focusableItems, subtree);
    const activeIds = getAncestorTreeIds(state.forest, activeId);
    return { ...state, activeIds };
    /*
     * FOCUS NEXT DESCENDANT
     */
  } else if (action.type === ActionType.FocusNextDescendant) {
    const nodeIndex = findIndex(state.forest)((id) => id === action.parentId);
    if (nodeIndex < 0) {
      return state;
    }
    let subtree = getSubtree(state.forest)(nodeIndex);
    subtree = removeNode(subtree)(0);

    const activeId = getNextFocusableIdInForest(state.focusableItems, subtree, getActiveId(state.activeIds));
    const activeIds = getAncestorTreeIds(state.forest, activeId);
    return { ...state, activeIds };
    /*
     * FOCUS PREV DESCENDANT
     */
  } else if (action.type === ActionType.FocusPrevDescendant) {
    const nodeIndex = findIndex(state.forest)((id) => id === action.parentId);
    if (nodeIndex < 0) {
      return state;
    }
    let subtree = getSubtree(state.forest)(nodeIndex);
    subtree = removeNode(subtree)(0);
    const activeId = getPreviousFocusableIdInForest(state.focusableItems, subtree, getActiveId(state.activeIds));
    const activeIds = getAncestorTreeIds(state.forest, activeId);

    return { ...state, activeIds };
    /*
     * SET FOCUS
     */
  } else if (action.type === ActionType.SetFocus) {
    const activeIds = getAncestorTreeIds(state.forest, action.id);
    return { ...state, activeIds };

    /*
     * FOCUS NEXT SIBLING
     */
  } else if (action.type === ActionType.FocusNextSibling) {
    const nodeIndex = findIndex(state.forest)((id) => id === action.id);
    if (nodeIndex < 0) {
      return state;
    }
    let subtree = removeDescendants(state.forest)(nodeIndex);
    const parentIndex = getParentIndex(subtree)(nodeIndex);
    subtree = getSubtree(subtree)(parentIndex);
    subtree = parentIndex < 0 ? subtree : removeNode(subtree)(0);
    const activeId = getNextFocusableIdInForest(state.focusableItems, subtree, action.id);
    const activeIds = getAncestorTreeIds(state.forest, activeId);
    return { ...state, activeIds };

    /*
     * FOCUS PREV SIBLING
     */
  } else if (action.type === ActionType.FocusPrevSibling) {
    const nodeIndex = findIndex(state.forest)((id) => id === action.id);
    if (nodeIndex < 0) {
      return state;
    }
    const parentIndex = getParentIndex(state.forest)(nodeIndex);
    let subtree = removeDescendants(state.forest)(nodeIndex);
    subtree = getSubtree(subtree)(parentIndex);
    subtree = parentIndex < 0 ? subtree : removeNode(subtree)(0);
    const activeId = getPreviousFocusableIdInForest(state.focusableItems, subtree, action.id);
    const activeIds = getAncestorTreeIds(state.forest, activeId);
    return { ...state, activeIds };

    /*
     * FOCUS PARENT
     */
  } else if (action.type === ActionType.FocusParent) {
    const nodeIndex = findIndex(state.forest)((id) => id === action.id);
    if (nodeIndex < 0) {
      return state;
    }
    const parentIndex = getParentIndex(state.forest)(nodeIndex);
    if (parentIndex < 0) {
      return { ...state, activeIds: [] };
    }
    const activeId = getValueByIndex(state.forest)(parentIndex);
    const activeIds = getAncestorTreeIds(state.forest, activeId);
    return { ...state, activeIds };

    /*
     * NONE OF ABOVE
     */
  } else {
    return state;
  }
};
