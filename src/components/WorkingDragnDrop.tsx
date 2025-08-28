import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type NodeProps,
  type Node,
  type Edge,
  ReactFlowProvider,
  type XYPosition,
  Handle,
  Position,
  addEdge,
  type Connection,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

let id = 0;
const getId = () => `node_${id++}`;

interface NodeData {
  label: string;
  tools: string[];
}

interface Tool {
  id: string;
  name: string;
  description: string;
}

interface DroppedData {
  type: 'agent' | 'tool';
  name: string;
}

const nodeTypes = {
  agent: AgentNode,
};

const tools: Tool[] = [
  { id: 'tool-1', name: 'bulk-doc-check', description: 'Helps in organizing the data and clear actionable items....' },
  { id: 'tool-2', name: 'data-analytics-tool', description: 'Helps in organizing the data and clear actionable items....' },
  { id: 'tool-3', name: 'web-search-tool', description: 'Helps in organizing the data and clear actionable items....' },
  { id: 'tool-4', name: 'ticket-classification', description: 'Helps in organizing the data and clear actionable items....' },
];

function AgentNode({ id, data }: NodeProps<NodeData>) {
  const { setNodes } = useReactFlow<Node<NodeData>, Edge>();

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedDataStr = event.dataTransfer.getData('application/reactflow');
    if (!droppedDataStr) return;
    const droppedData: DroppedData = JSON.parse(droppedDataStr);
    if (droppedData.type === 'tool') {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                tools: [...node.data.tools, droppedData.name],
              },
            };
          }
          return node;
        })
      );
      event.stopPropagation();
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="border border-black p-4 bg-white w-52 rounded shadow relative"
    >
      <Handle type="target" position={Position.Top} className="w-4 h-4" />
      <h3 className="text-lg font-semibold mb-2">{data.label}</h3>
      <div className="text-sm font-medium mb-1">Tools:</div>
      <ul className="list-disc pl-5 text-sm">
        {data.tools.map((tool, index) => (
          <li key={index}>{tool}</li>
        ))}
      </ul>
      <Handle type="source" position={Position.Bottom} className="w-4 h-4" />
    </div>
  );
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow<Node<NodeData>, Edge>();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const droppedDataStr = event.dataTransfer.getData('application/reactflow');
      if (!droppedDataStr) return;
      const droppedData: DroppedData = JSON.parse(droppedDataStr);
      if (droppedData.type !== 'agent') return;

      const position: XYPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: getId(),
        type: 'agent',
        position,
        data: { label: droppedData.name, tools: [] },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className="flex h-screen">
      <div className="w-52 p-4 border-r border-gray-300 bg-gray-50">
        <h3 className="text-lg font-bold mb-4">Add Assets</h3>
        <div
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(
              'application/reactflow',
              JSON.stringify({ type: 'agent', name: 'Agent' } as DroppedData)
            );
            event.dataTransfer.effectAllowed = 'move';
          }}
          className="p-2 mb-2 bg-gray-100 cursor-grab rounded shadow hover:bg-gray-200"
        >
          Drag Agent
        </div>
        <h3 className="text-lg font-bold mb-4 mt-6">Tools</h3>
        {tools.map((tool) => (
          <div
            key={tool.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData(
                'application/reactflow',
                JSON.stringify({ type: 'tool', name: tool.name } as DroppedData)
              );
              event.dataTransfer.effectAllowed = 'move';
            }}
            className="p-2 mb-2 bg-gray-100 cursor-grab rounded shadow hover:bg-gray-200"
          >
            {tool.name}
          </div>
        ))}
      </div>
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}