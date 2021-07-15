export interface TreeNode<T> {
  value: T;
  length: number;
  /* Precomputed values */
  level: number;
}
export const copyTreeNode = <T>(node: TreeNode<T>): TreeNode<T> => ({ ...node });
export const createTreeNode = <T>(value: T): TreeNode<T> => ({ value, level: 0, length: 1 });

export const getTreeNodeValue = <T>(node: TreeNode<T>): T => node.value;
export const getTreeNodeLevel = <T>(node: TreeNode<T>): number => node.level;
export const getTreeNodeLength = <T>(node: TreeNode<T>): number => node.length;

export const setTreeNodeValue =
  <T>(node: TreeNode<T>) =>
  <B>(value: B): TreeNode<B> => ({ ...node, value });

export const setTreeNodeLevel =
  <T>(node: TreeNode<T>) =>
  (level: number): TreeNode<T> => ({ ...node, level });

export const setTreeNodeLength =
  <T>(node: TreeNode<T>) =>
  (length: number): TreeNode<T> => ({ ...node, length });

export const addTreeNodeLevel =
  <T>(node: TreeNode<T>) =>
  (levelStep: number): TreeNode<T> => ({ ...node, level: node.level + levelStep });

export const addTreeNodeLength =
  <T>(node: TreeNode<T>) =>
  (lengthStep: number): TreeNode<T> => ({ ...node, length: node.length + lengthStep });
