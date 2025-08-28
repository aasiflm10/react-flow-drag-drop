// src/components/FlowCanvas.tsx

import {
    addEdge,
    Background,
    Controls,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow,
    type Connection,
} from '@xyflow/react';
import { useCallback, useMemo, useRef } from 'react';
import type { AgentNode, DroppedData } from '../types';
import AgentNodeComponent from './AgentNode';

import '@xyflow/react/dist/style.css';

let id = 1;
const getId = () => `agent_${id++}`;

export default function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<AgentNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow<AgentNode>();

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
      if (!droppedDataStr || !reactFlowWrapper.current) return;

      const droppedData: DroppedData = JSON.parse(droppedDataStr);

      // Only accept drops of type 'agent' on the canvas
      if (droppedData.type !== 'agent') return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: AgentNode = {
        id: getId(),
        type: 'agent',
        position,
        data: {
          label: droppedData.payload.name,
          modelFamily: 'Anthropic',
          modelName: 'Claude 3 Sonnet',
          tools: [],
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const nodeTypes = useMemo(() => ({ agent: AgentNodeComponent }), []);

  return (
    <div className="flex-1 h-full" ref={reactFlowWrapper}>
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
        className="bg-[#2D2D2D]"
      >
        <Background color="#555" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}