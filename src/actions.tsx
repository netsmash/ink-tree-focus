import { DOMElement } from 'ink';

export enum ActionType {
  RegisterNode = '[Focus Manager] Register focusable node',
  UnregisterNode = '[Focus Manager] Unregister focusable node',
  SetFocus = '[Focus Manager] Set focus to element by id',
  FocusPrev = '[Focus Manager] Focus previous element',
  FocusNext = '[Focus Manager] Focus next element',
  FocusPrevChild = '[Focus Manager] Focus previous child element',
  FocusNextChild = '[Focus Manager] Focus next child element',
  FocusPrevDescendant = '[Focus Manager] Focus previous descendant element',
  FocusNextDescendant = '[Focus Manager] Focus next descendant element',
  FocusPrevSibling = '[Focus Manager] Focus previous sibling element',
  FocusNextSibling = '[Focus Manager] Focus next sibling element',
  FocusParent = '[Focus Manager] Focus previous parent element',
}

/** Actions */
export interface RegisterNodeAction {
  type: ActionType.RegisterNode;
  id: Symbol;
  element: DOMElement;
  focusable: boolean;
}
export const registerNode = (id: Symbol, element: DOMElement, focusable: boolean): RegisterNodeAction => ({
  type: ActionType.RegisterNode,
  id,
  element,
  focusable,
});

export interface UnregisterNodeAction {
  type: ActionType.UnregisterNode;
  id: Symbol;
}
export const unregisterNode = (id: Symbol): UnregisterNodeAction => ({
  type: ActionType.UnregisterNode,
  id,
});

export interface SetFocusAction {
  type: ActionType.SetFocus;
  id: Symbol;
}
export const setFocus = (id: Symbol): SetFocusAction => ({
  type: ActionType.SetFocus,
  id,
});

export interface FocusPrevAction {
  type: ActionType.FocusPrev;
  id?: Symbol;
}
export const focusPrev = (id?: Symbol): FocusPrevAction => ({
  type: ActionType.FocusPrev,
  id,
});

export interface FocusNextAction {
  type: ActionType.FocusNext;
  id?: Symbol;
}
export const focusNext = (id?: Symbol): FocusNextAction => ({
  type: ActionType.FocusNext,
  id,
});

export interface FocusPrevChildAction {
  type: ActionType.FocusPrevChild;
  parentId?: Symbol;
}
export const focusPrevChild = (parentId?: Symbol): FocusPrevChildAction => ({
  type: ActionType.FocusPrevChild,
  parentId,
});

export interface FocusNextChildAction {
  type: ActionType.FocusNextChild;
  parentId?: Symbol;
}
export const focusNextChild = (parentId?: Symbol): FocusNextChildAction => ({
  type: ActionType.FocusNextChild,
  parentId,
});

export interface FocusPrevDescendantAction {
  type: ActionType.FocusPrevDescendant;
  parentId?: Symbol;
}
export const focusPrevDescendant = (parentId?: Symbol): FocusPrevDescendantAction => ({
  type: ActionType.FocusPrevDescendant,
  parentId,
});

export interface FocusNextDescendantAction {
  type: ActionType.FocusNextDescendant;
  parentId?: Symbol;
}
export const focusNextDescendant = (parentId?: Symbol): FocusNextDescendantAction => ({
  type: ActionType.FocusNextDescendant,
  parentId,
});

export interface FocusPrevSiblingAction {
  type: ActionType.FocusPrevSibling;
  id: Symbol;
}
export const focusPrevSibling = (id: Symbol): FocusPrevSiblingAction => ({
  type: ActionType.FocusPrevSibling,
  id,
});

export interface FocusNextSiblingAction {
  type: ActionType.FocusNextSibling;
  id: Symbol;
}
export const focusNextSibling = (id: Symbol): FocusNextSiblingAction => ({
  type: ActionType.FocusNextSibling,
  id,
});

export interface FocusParentAction {
  type: ActionType.FocusParent;
  id: Symbol;
}
export const focusParent = (id: Symbol): FocusParentAction => ({
  type: ActionType.FocusParent,
  id,
});

export type Action =
  | RegisterNodeAction
  | UnregisterNodeAction
  | SetFocusAction
  | FocusPrevAction
  | FocusNextAction
  | FocusPrevChildAction
  | FocusNextChildAction
  | FocusPrevDescendantAction
  | FocusNextDescendantAction
  | FocusPrevSiblingAction
  | FocusNextSiblingAction
  | FocusParentAction;
