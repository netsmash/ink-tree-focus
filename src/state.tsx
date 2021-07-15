import { DOMElement } from 'ink';
import { PreOrderForest } from './tree';

export interface FocusableItem {
  id: Symbol;
  domElement: DOMElement;
  focusable: boolean;
}

export interface State {
  forest: PreOrderForest<Symbol>;
  focusableItems: Map<Symbol, FocusableItem>;
  activeIds: Symbol[];
}
export const getInitialState = (): State => ({
  forest: [],
  focusableItems: new Map(),
  activeIds: [],
});
