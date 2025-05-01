import React from 'react';
import { useAppSelector } from '../app/hooks';
import Node from './Node';
import { FileNode } from '../types/FileNode'; 

const Explorer = () => {
  const root = useAppSelector(state => state.explorer.root);

  return (
    <div>
      {root.map((node: FileNode) => (
        <Node key={node.id} node={node} />
      ))}
    </div>
  );
};

export default Explorer;
