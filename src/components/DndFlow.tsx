import React, { useRef, useCallback } from 'react';
// Imports are updated to use a CDN (esm.sh) to resolve the module loading error.
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Background,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';


// A simple initial node to start with
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Start Here' },
    position: { x: 250, y: 5 },
  },
];

// This is a unique identifier for our drag-and-drop data
const DRAG_DATA_FORMAT = 'application/reactflow';

// --- Custom Sidebar Component ---
// This component displays the draggable node types.
const Sidebar = () => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    // When a drag starts, we store the node type in the event's dataTransfer object.
    event.dataTransfer.setData(DRAG_DATA_FORMAT, nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="border-r border-gray-200 p-4 text-sm bg-gray-50 w-64 h-full">
      <h2 className="text-lg font-bold mb-4">Node Palette</h2>
      <p className="text-xs text-gray-500 mb-4">Drag these nodes to the canvas on the right.</p>
      
      {/* Draggable element for a default node */}
      <div
        className="bg-white p-3 border-2 border-dashed rounded-md cursor-grab flex justify-center items-center text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
        onDragStart={(event) => onDragStart(event, 'default')}
        draggable
      >
        Default Node
      </div>
      
      {/* Draggable element for an input node */}
      <div
        className="bg-white p-3 border-2 border-dashed rounded-md cursor-grab flex justify-center items-center text-gray-600 hover:border-green-500 hover:text-green-500 transition-colors mt-4"
        onDragStart={(event) => onDragStart(event, 'input')}
        draggable
      >
        Input Node
      </div>

      {/* Draggable element for an output node */}
      <div
        className="bg-white p-3 border-2 border-dashed rounded-md cursor-grab flex justify-center items-center text-gray-600 hover:border-red-500 hover:text-red-500 transition-colors mt-4"
        onDragStart={(event) => onDragStart(event, 'output')}
        draggable
      >
        Output Node
      </div>
    </aside>
  );
};



export const DnDFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // We use the useReactFlow hook to get access to the React Flow instance.
  const { screenToFlowPosition } = useReactFlow();

  // A simple counter for creating unique node IDs
  // Using useRef to persist the id counter across re-renders without causing them.
  const nodeIdCounter = useRef(nodes.length);
  const getId = () => `dndnode_${++nodeIdCounter.current}`;

  // Callback for handling new connections between nodes
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // This function handles the drag-over event on the canvas.
  // It's necessary to prevent the default browser behavior to allow a drop.
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // This function handles the drop event.
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // Check if the dropped data has the correct format
      const type = event.dataTransfer.getData(DRAG_DATA_FORMAT);

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // We need to convert the screen position of the drop to the flow's coordinate system.
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create the new node object
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      // Add the new node to the existing nodes
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div className="flex h-screen w-full" ref={reactFlowWrapper}>
      <Sidebar />
      <div className="flex-grow h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView // Zooms and pans the viewport to fit all nodes
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
};