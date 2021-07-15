import React, { useState, useEffect, useRef } from 'react';
import { Box, BoxProps, DOMElement, render, Spacer, Text, useInput } from 'ink';
import { FocusInputCapture, FocusManagerProvider, useFocusManager } from '../dist';
import { focusNextSibling, focusPrevSibling } from '../dist/actions';

/*
 * List Item Component
 */
interface IFocusableItemProps extends BoxProps {
  delete: () => void;
}
const FocusableItem: React.FC<IFocusableItemProps> = ({ delete: performDelete, children, ...boxProps }) => {
  const { focusRef, isFocused } = useFocusManager();

  useInput(
    (input, key) => {
      if (key.delete || input === 'x') {
        performDelete();
      }
    },
    { isActive: isFocused },
  );

  return (
    <Box {...boxProps} ref={focusRef} borderStyle="round" borderColor={isFocused ? 'red' : ''}>
      {children}
    </Box>
  );
};

/*
 * List Component
 */
interface IListProps extends BoxProps {
  label: string;
  createInput: string;
}
const List: React.FC<IListProps> = ({ label, createInput, ...boxProps }) => {
  const [itemCounter, setItemCounter] = useState(0);
  const children = useRef<{ [key: number]: React.ReactNode }>({});
  const { focusRef, focusId, isDescendantFocused, focusPrevChild, focusNextChild } = useFocusManager({
    isFocusable: false,
  });

  const [_, setForceUpdate] = useState(Date.now());
  const forceUpdate = () => setForceUpdate(Date.now());

  const removeItem = (key: number) => () => {
    delete children.current[key];
    forceUpdate();
  };

  useInput((input, key) => {
    if (input === createInput) {
      children.current[itemCounter] = (
        <FocusableItem key={itemCounter} delete={removeItem(itemCounter)}>
          <Text>Item {itemCounter + 1}</Text>
        </FocusableItem>
      );
      setItemCounter(itemCounter + 1);
    }
  });

  useInput(
    (input, key) => {
      if (key.leftArrow) {
        focusPrevChild(focusId);
      } else if (key.rightArrow) {
        focusNextChild(focusId);
      }
    },
    { isActive: isDescendantFocused },
  );

  return (
    <Box flexDirection="column" justifyContent="center" flexGrow={1}>
      <Box flexDirection="row">
        <Text>{label}</Text>
        {isDescendantFocused && <Text color="green"> Press left / right to move only among this list</Text>}
      </Box>
      <Box {...boxProps} ref={focusRef} borderStyle="round" borderColor={isDescendantFocused ? 'red' : ''} flexGrow={1}>
        {Object.values(children.current)}
      </Box>
    </Box>
  );
};

/*
 * App Component
 */
const App = () => {
  const { focusRef, focusId, focusPrevChild, focusNextChild } = useFocusManager({ isFocusable: false });

  useInput((input, key) => {
    if (key.upArrow) {
      focusPrevChild(focusId);
    } else if (key.downArrow) {
      focusNextChild(focusId);
    }
  });

  useInput((input, key) => {
    if (input === 'q') {
      process.exit(0);
    }
  });

  return (
    <Box ref={focusRef} flexDirection="column">
      <List label="List A" createInput="a" />
      <List label="List B" createInput="b" />
      <List label="List C" createInput="c" />
      <Text color="green">Press a,b,c to add an item on corresponding list</Text>
      <Text color="green">Press up / down to move among non empty lists</Text>
      <Text color="green">Press tab / shift + tab to move among focusable elements.</Text>
      <Text color="red">Observe order do not depends on elements creation but on the tree structure.</Text>
      <Text color="green">Press q to quit</Text>
    </Box>
  );
};

/*
 * Rendering
 */
render(
  <FocusManagerProvider>
    <FocusInputCapture>
      <App />
    </FocusInputCapture>
  </FocusManagerProvider>,
);
