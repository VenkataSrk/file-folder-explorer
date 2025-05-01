import React, { useState } from 'react';
import { FileNode } from '../types/FileNode';
import { useAppDispatch } from '../app/hooks';
import { addNode, renameNode, deleteNodeAction, moveNodes } from '../helpers/explorer/explorerSlice';

const Node: React.FC<{ node: FileNode }> = ({ node }) => {
  const dispatch = useAppDispatch();
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [isOver, setIsOver] = useState(false);
  const [type, setType] = useState<'file' | 'folder'>('folder');
  const isRoot = node.name === 'Root';

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', node.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.type === 'folder') setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === node.id || node.type !== 'folder') return;

    dispatch(moveNodes({ id: draggedId, newParentId: node.id }));
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    dispatch(addNode({ parentId: node.id, name: newName, type }));
    setNewName('');
    setShowInput(false);
  };

  const handleRename = () => {
    if (!editName.trim()) return;
    dispatch(renameNode({ id: node.id, name: editName }));
    setEditMode(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${node.name}"?`)) {
      dispatch(deleteNodeAction({ id: node.id }));
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        marginLeft: 20,
        padding: 5,
        border: isOver ? '2px dashed blue' : '1px solid #ddd',
        backgroundColor: isOver ? '#e6f7ff' : 'transparent',
        borderRadius: 4,
      }}
    >
      {editMode ? (
        <div>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} />
          <button onClick={handleRename}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <span>
          📄📁 {node.name}{' '}
          {!isRoot && (
            <>
              <button onClick={() => setEditMode(true)}>Rename</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </span>
      )}

      {node.type === 'folder' && (
        <>
          <button onClick={() => setShowInput(!showInput)}>+ New</button>
          {showInput && (
            <div>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
              />
              <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="folder">Folder</option>
                <option value="file">File</option>
              </select>
              <button onClick={handleCreate}>Create</button>
            </div>
          )}
          {node.children?.map((child) => (
            <Node key={child.id} node={child} />
          ))}
        </>
      )}
    </div>
  );
};

export default Node;
