import { DOMElement, Key, useInput } from 'ink';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { getInitialState, State } from './state';
import {
  Action,
  focusNext,
  focusNextChild,
  focusNextDescendant,
  focusNextSibling,
  focusParent,
  focusPrev,
  focusPrevChild,
  focusPrevDescendant,
  focusPrevSibling,
  registerNode,
  setFocus,
  unregisterNode,
} from './actions';
import { reducer } from './reducer';
import { getActiveId } from './utils';

export const FocusManagerContext = createContext<[State, React.Dispatch<Action>]>([getInitialState(), () => {}]);
export interface IFocusManagerProviderProps {}
export const FocusManagerProvider: React.FC<IFocusManagerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  return <FocusManagerContext.Provider value={[state, dispatch]}>{children}</FocusManagerContext.Provider>;
};

export interface IUseFocusManagerProps {
  isFocusable?: boolean;
  focusRef?: React.MutableRefObject<DOMElement | null>;
}
export interface IUseFocusManagerReturn {
  focusId: Symbol;
  isFocused: boolean;
  isDescendantFocused: boolean;
  focusRef: React.MutableRefObject<DOMElement | null>;
  activeId?: Symbol;
  setFocus: (id: Symbol) => void;
  focusPrev: (id?: Symbol) => void;
  focusNext: (id?: Symbol) => void;
  focusPrevChild: (id?: Symbol) => void;
  focusNextChild: (id?: Symbol) => void;
  focusPrevDescendant: (id?: Symbol) => void;
  focusNextDescendant: (id?: Symbol) => void;
  focusPrevSibling: (id?: Symbol) => void;
  focusNextSibling: (id?: Symbol) => void;
  focusParent: (id?: Symbol) => void;
}
export const useFocusManager = (props: IUseFocusManagerProps = {}): IUseFocusManagerReturn => {
  const [{ activeIds }, dispatch] = useContext(FocusManagerContext);
  const focusId = useMemo(() => Symbol(Date.now() % 100000), []);
  const focusRef = props.focusRef || useRef<DOMElement>(null);
  const isFocusable = props.isFocusable === undefined || props.isFocusable;

  useEffect(() => {
    if (!focusRef.current || !focusId) {
      return;
    }
    const element: DOMElement = focusRef.current;
    dispatch(registerNode(focusId, element, isFocusable));
    return () => dispatch(unregisterNode(focusId));
  }, [focusRef, isFocusable]);

  const activeId = getActiveId(activeIds);

  return {
    focusId,
    focusRef,
    isFocused: activeId === focusId,
    isDescendantFocused: activeId !== focusId && activeIds.includes(focusId),
    activeId,
    setFocus: (id: Symbol) => dispatch(setFocus(id)),
    focusPrev: (id?: Symbol) => dispatch(focusPrev(id || activeId)),
    focusNext: (id?: Symbol) => dispatch(focusNext(id || activeId)),
    focusPrevChild: (id?: Symbol) => dispatch(focusPrevChild(id || activeId)),
    focusNextChild: (id?: Symbol) => dispatch(focusNextChild(id || activeId)),
    focusPrevDescendant: (id?: Symbol) => dispatch(focusPrevDescendant(id || activeId)),
    focusNextDescendant: (id?: Symbol) => dispatch(focusNextDescendant(id || activeId)),
    focusPrevSibling: (id?: Symbol) =>
      (id || activeId) !== undefined && dispatch(focusPrevSibling((id || activeId) as Symbol)),
    focusNextSibling: (id?: Symbol) =>
      (id || activeId) !== undefined && dispatch(focusNextSibling((id || activeId) as Symbol)),
    focusParent: (id?: Symbol) => (id || activeId) !== undefined && dispatch(focusParent((id || activeId) as Symbol)),
  };
};

export interface IFocusInputCaptureProps {}
export const FocusInputCapture: React.FC<IFocusInputCaptureProps> = ({ children }) => {
  const { focusPrev: prev, focusNext: next } = useFocusManager();

  useInput((input: string, key: Key) => {
    if (!key.tab) {
      // Do nothing
    } else if (key.shift) {
      prev();
    } else {
      next();
    }
  });

  return <>{children}</>;
};
