# Ink Tree Focus

This package for [Ink](https://github.com/vadimdemedes/ink#useful-components) manages focus similarly to [Ink focus](https://github.com/cAttte/ink-focus) but it does by respecting the tree structure, instead the creation order.

## Install

```
npm install ink-tree-focus
```

## Basic Usage

Lets analyze the following basic example:

```typescript
import React from 'react';
import { Box, BoxProps, render, Text, useApp, useInput } from 'ink';
import { FocusInputCapture, FocusManagerProvider, useFocusManager } from 'ink-tree-focus';

interface IFocusableItemProps extends BoxProps {
  children: React.ReactNode;
}
const FocusableItem = ({ children, ...boxProps }: IFocusableItemProps) => {
  const { focusRef, isFocused } = useFocusManager();

  return (
    <Box {...boxProps} ref={focusRef}
      borderStyle='round'
      borderColor={isFocused ? 'red' : ''}
    >
      {children}
    </Box>
  );
};

const App = () => {
  const { exit } = useApp();
  const { focusRef } = useFocusManager({ isFocusable: false });

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
  });

  return (
    <>
      <Text>Use Tab / shift + Tap to move</Text>
      <Box ref={focusRef} flexDirection="row">
        <FocusableItem><Text>Box 1</Text></FocusableItem>
        <FocusableItem><Text>Box 2</Text></FocusableItem>
        <FocusableItem flexDirection="column">
          <Text>Box 3</Text>
          <Box flexDirection="row">
            <FocusableItem><Text>1</Text></FocusableItem>
            <FocusableItem><Text>2</Text></FocusableItem>
          </Box>
        </FocusableItem>
        <FocusableItem><Text>Box 4</Text></FocusableItem>
      </Box>
      <Text>Press q to quit</Text>
    </>
  );
};

render(
  <FocusManagerProvider>
    <FocusInputCapture>
      <App />
    </FocusInputCapture>
  </FocusManagerProvider>,
);
```


First of all, the library provides (essentially) three objects:

- `FocusManagerProvider`: Used to provide the application the React's context provider with all the logic for the app. Must wrap the app, then you can forget about it.
- `FocusInputCapture`: A predefined wrapper with the only purpose of bind `tab` key to focus next element and `shift + tab` to previous element. You can omite it and make your custom binding.
- `useFocusManager`: The hook which provides all the resources to manage the focus system. That is the main of the library.

Also in the example we see the use of `focusRef`, used to bind the DOMElement to the internal tree of focusables, and `isFocused`, which tells if that DOMElement has currently the focus.

There are more concrete and useful items provide by the hook, which can be found in the API description.

## Example

```
npm run example
```

## API

### Hook `useFocusManager`

Usage: `const returned = useFocusManager(props)` where
`props` is optional and has the optional members:

- `isFocusable`
  - Type `boolean`
  - Determines if this node can be focused.

- `focusRef`
  - Type `React.MutableRefObject<DOMElement | null>`

and `returned` provide the following information:

- `focusId`
  - Type: `Symbol`
  - A `Symbol` that identifies the focus node.

- `focusRef`
  - Type: `{current: Ink.DOMElement}`
  - A reference (created with react's `useRef`) which component should reference to. That's needed to bind the DOMElement to a focusable node.

- `isFocused`
  - Type: `boolean`
  - Determine if the refecenced element is focused or not.

- `isDescendantFocused`
  - Type `boolean`
  - Determine if some estrictly descendant (not includes itself) element is focused.

- `activeId`
  - Type `Symbol | undefined`
  - The focusId of the currently focused node, if any.

and the following commands:

- `setFocus`
  - Type `(focusId: Symbol) => void`
  - Set focus to element with focus id `focusId`.

- `focusPrev`
  - Type `(focusId?: Symbol) => void`
  - Focus the previous node in preorder.
    If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`.
    If `activeId` is not defined, it will focus last element.

- `focusNext`
  - Type `(focusId?: Symbol) => void`
  - Focus the next node in preorder.
    If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`.
    If `activeId` is not defined, it will focus first element.

- `focusPrevChild`
  - Type `(focusId?: Symbol) => void`
  - Focus the previous child node in preorder.
    If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`.
    If `activeId` is not defined in the relevant subtree, it will focus last element.

- `focusNextChild`
  - Type `(focusId?: Symbol) => void`
  - Focus the next child node in preorder.
    If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`.
    If `activeId` is not defined in the relevant subtree, it will focus first element.

- `focusPrevSibling`
  - Type `(focusId?: Symbol) => void`
  - Focus the previous sibling node in preorder.
    If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`.
    If `activeId` is not defined, nothing will happen.

- `focusNextSibling`
  - Type `(focusId?: Symbol) => void`
  - Focus the next sibling node in preorder.
    If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`.
    If `activeId` is not defined, nothing will happen.

- `focusParent`
  - Type `(focusId?: Symbol) => void`
  - Focus the parent node in preorder.
    If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`.
    If `activeId` is not defined, nothing will happen.
    If no parent node exists, `activeId` will be set to `undefined`.
