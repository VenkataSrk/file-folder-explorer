import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileNode, NodeType } from '../../types/FileNode';
import { v4 as uuid } from 'uuid';

interface ExplorerState {
  root: FileNode[];
}

const initialState: ExplorerState = {
  root: [{ id: uuid(), name: 'Root', type: 'folder', children: [] }],
};

const findNode = (nodes: FileNode[], id: string): FileNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const removeNode = (nodes: FileNode[], id: string): FileNode | null => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
  
      if (node.id === id) {
        nodes.splice(i, 1);
        return node;
      }
  
      if (node.type === 'folder' && node.children) {
        const removed = removeNode(node.children, id);
        if (removed) return removed;
      }
    }
  
    return null; 
  };


const deleteNode = (nodes: FileNode[], id: string): FileNode[] => {
    return nodes.filter(n => {
      if (n.id === id) return false;
      if (n.children) n.children = deleteNode(n.children, id);
      return true;
    });
  };

export const explorerSlice = createSlice({
  name: 'explorer',
  initialState,
  reducers: {
    addNode(state, action: PayloadAction<{ parentId: string; name: string; type: NodeType }>) {
      const parent = findNode(state.root, action.payload.parentId);
      if (parent && parent.type === 'folder') {
        parent.children = parent.children || [];
        parent.children.push({
          id: uuid(),
          name: action.payload.name,
          type: action.payload.type,
          children: action.payload.type === 'folder' ? [] : undefined,
        });
      }
    },
    renameNode(state, action: PayloadAction<{ id: string; name: string }>) {
        const updateName = (nodes: FileNode[]): boolean => {
          for (let node of nodes) {
            if (node.id === action.payload.id) {
              node.name = action.payload.name;
              return true;
            }
            if (node.children && updateName(node.children)) return true;
          }
          return false;
        };
      
        updateName(state.root);
      },
      deleteNodeAction(state, action: PayloadAction<{ id: string }>) {
      state.root = deleteNode(state.root, action.payload.id);
    },
    moveNodes(state, action: PayloadAction<{ id: string; newParentId: string }>) {
        const { id, newParentId } = action.payload;
        if (id === newParentId) return;
        const removeNode = (nodes: FileNode[]): [FileNode | null, FileNode[]] => {
          let removed: FileNode | null = null;
          const filtered = nodes.filter(node => {
            if (node.id === id) {
              removed = node;
              return false;
            }
            if (node.children) {
              const [childRemoved, updatedChildren] = removeNode(node.children);
              if (childRemoved) {
                node.children = updatedChildren;
                removed = childRemoved;
              }
            }
            return true;
          });
          return [removed, filtered];
        };
      
        const [nodeToMove, updatedRoot] = removeNode(state.root);
        if (!nodeToMove) return;
      
        const isDescendant = (parent: FileNode, childId: string): boolean => {
          if (!parent.children) return false;
          for (const child of parent.children) {
            if (child.id === childId || isDescendant(child, childId)) {
              return true;
            }
          }
          return false;
        };
        const newParent = findNode(updatedRoot, newParentId);
        if (newParent && isDescendant(nodeToMove, newParentId)) return;
        const insertNode = (nodes: FileNode[], targetId: string): boolean => {
          for (const node of nodes) {
            if (node.id === targetId && node.type === 'folder') {
              node.children = node.children || [];
              node.children.push(nodeToMove);
              return true;
            }
            if (node.children && insertNode(node.children, targetId)) {
              return true;
            }
          }
          return false;
        };
      
        state.root = updatedRoot;
        insertNode(state.root, newParentId);
      },
  },
});

export const { addNode, renameNode, deleteNodeAction , moveNodes } = explorerSlice.actions;
export default explorerSlice.reducer;
