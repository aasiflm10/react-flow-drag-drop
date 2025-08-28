// src/components/Sidebar.tsx

import { User, Wrench } from 'lucide-react';
import { type Tool, type DroppedData } from '../types';

interface SidebarProps {
  tools: Tool[];
}

// A single draggable item in the sidebar
const DraggableItem = ({ children, data }: { children: React.ReactNode, data: DroppedData }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-3 mb-3 bg-[#2D2D2D] border border-gray-600 rounded-md cursor-grab transition-colors hover:bg-gray-700"
    >
      {children}
    </div>
  );
};

export default function Sidebar({ tools }: SidebarProps) {
  return (
    <aside className="w-80 p-4 bg-[#1E1E1E] border-r border-gray-700 text-white flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Asset Library</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Add New Assets</h3>
        <DraggableItem data={{ type: 'agent', payload: { name: 'Single Agent' } }}>
          <User className="text-blue-400" />
          <span>Agent</span>
        </DraggableItem>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-2">Choose from Existing Assets</h3>
        <p className="text-xs text-gray-500 mb-3">Tools</p>
        <div className="flex flex-col">
          {tools.map((tool) => (
            <DraggableItem key={tool.id} data={{ type: 'tool', payload: tool }}>
              <Wrench className="text-yellow-400" />
              <div className="flex flex-col">
                <span className="font-semibold">{tool.name}</span>
                <span className="text-xs text-gray-400">{tool.description}</span>
              </div>
            </DraggableItem>
          ))}
        </div>
      </div>
    </aside>
  );
}