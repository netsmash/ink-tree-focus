## Install

```
npm install ink-tree-focus
```

## Example

```
npm run example
```

## API

### `useFocusManager` received props

#### focusId

Type: `Symbol`
A `Symbol` that identifies the focus node.

#### focusRef

Type: `{current: Ink.DOMElement}`
A reference (created with react's `useRef`) which component should reference to. That's needed to bind the DOMElement to a focusable node.

#### isFocused

Type: `boolean`
Determine if the refecenced element is focused or not.

#### isDescendantFocused

Type `boolean`
Determine if some descendant element is focused.

#### activeId

Type `Symbol | undefined`
The focusId of the currently focused node, if any.

#### setFocus

Type `(focusId: Symbol) => void`
Set focus to element with focus id `focusId`.

#### focusPrev

Type `(focusId?: Symbol) => void`
Focus the previous node in preorder. If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`. If `activeId` is not defined, it will focus last element.

#### focusNext

Type `(focusId?: Symbol) => void`
Focus the next node in preorder. If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`. If `activeId` is not defined, it will focus first element.

#### focusPrevChild

Type `(focusId?: Symbol) => void`
Focus the previous child node in preorder. If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`. If `activeId` is not defined in the relevant subtree, it will focus last element.

#### focusNextChild

Type `(focusId?: Symbol) => void`
Focus the next child node in preorder. If `focusId` is provided, operation will be done with respect `focusId`, otherwise the `activeId`. If `activeId` is not defined in the relevant subtree, it will focus first element.

#### focusPrevSibling

Type `(focusId?: Symbol) => void`
Focus the previous sibling node in preorder. If `focusId`is provided, operation will be done with respect `focusId`, otherwise the `activeId`. If `activeId` is not defined, nothing will happen.

#### focusNextSibling

Type `(focusId?: Symbol) => void`
Focus the next sibling node in preorder. If `focusId`is provided, operation will be done with respect `focusId`, otherwise the `activeId`. If `activeId` is not defined, nothing will happen.

#### focusParent

Type `(focusId?: Symbol) => void`
Focus the parent node in preorder. If `focusId`is provided, operation will be done with respect `focusId`, otherwise the `activeId`. If `activeId` is not defined, nothing will happen. If no parent node exists, `activeId` will be set to `undefined`.
