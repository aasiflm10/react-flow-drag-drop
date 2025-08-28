// src/components/AgentNode.tsx

import { useState } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { User, Wrench, X } from 'lucide-react';
import type { AgentNodeData, DroppedData, AgentNode as AgentNodeType, Tool } from '../types';
import clsx from 'clsx';

export default function AgentNode({ id, data }: NodeProps<AgentNodeData>) {
  const { setNodes } = useReactFlow<AgentNodeType>();
  // NEW: State to track when a draggable item is over the node
  const [isDragOver, setIsDragOver] = useState(false);

  // --- Drag and Drop Handlers for UX Feedback and Functionality ---

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Check if the dragged item is a tool to provide visual feedback
    if (event.dataTransfer.types.includes('application/reactflow')) {
        setIsDragOver(true);
    }
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false); // Reset visual state on drop
    
    const droppedDataStr = event.dataTransfer.getData('application/reactflow');
    if (!droppedDataStr) return;

    const droppedData: DroppedData = JSON.parse(droppedDataStr);
    
    if (droppedData.type === 'tool') {
      const newTool: Tool = droppedData.payload;
      
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const toolExists = node.data.tools.some((t) => t.id === newTool.id);
            if (!toolExists) {
              // FIXED: Create new node and data objects for immutable update
              const updatedNode = {
                ...node,
                data: {
                  ...node.data,
                  tools: [...node.data.tools, newTool],
                },
              };
              return updatedNode;
            }
          }
          return node;
        })
      );
      event.stopPropagation();
    }
  };
  
  // NEW: Handler to delete a tool from the agent
  const handleDeleteTool = (toolIdToRemove: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          // Create a new tools array without the removed tool
          const updatedTools = node.data.tools.filter(
            (tool) => tool.id !== toolIdToRemove
          );
          // Return a new node object to ensure re-render
          return {
            ...node,
            data: {
              ...node.data,
              tools: updatedTools,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    // Add the new drag event handlers to the main node div
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className="bg-[#2D2D2D] border-2 border-purple-600 rounded-lg shadow-lg w-80 text-white transition-all duration-200"
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <User className="text-blue-400" />
          <div>
            <h3 className="font-bold">{data.label}</h3>
            <p className="text-xs text-gray-400">{`${data.modelFamily} ${data.modelName}`}</p>
          </div>
        </div>
        
        {/* UPDATED: The tool drop zone now changes appearance when dragging over */}
        <div
          className={clsx(
            'min-h-[60px] p-2 border border-dashed rounded-md transition-colors duration-200',
            isDragOver ? 'border-purple-400 bg-purple-500/20' : 'border-gray-500'
          )}
        >
          <div className="text-sm text-gray-300 mb-2">Tools ({data.tools.length})</div>
          {data.tools.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.tools.map((tool) => (
                // UPDATED: Tool "pill" now includes a delete button
                <div 
                  key={tool.id} 
                  className="flex items-center gap-1.5 bg-yellow-600/80 text-white text-xs pl-2 pr-1 py-1 rounded-full"
                >
                  <Wrench size={12} />
                  <span>{tool.name}</span>
                  <button 
                    onClick={() => handleDeleteTool(tool.id)} 
                    className="ml-1 p-0.5 rounded-full hover:bg-black/20 transition-colors"
                    aria-label={`Remove ${tool.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-500 pt-2">
              {isDragOver ? 'Release to add tool' : 'Drop tool here'}
            </p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}