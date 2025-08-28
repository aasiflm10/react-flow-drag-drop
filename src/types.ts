// src/types.ts

import { type Node } from '@xyflow/react';

// Defines the structure for a tool asset
export interface Tool {
  id: string;
  name: string;
  description: string;
}

// Data structure for our custom Agent node
export interface AgentNodeData extends Record<string, unknown>  {
  label: string;
  modelFamily: string;
  modelName: string;
  tools: Tool[];
}

// A type alias for a Node using our custom data structure
export type AgentNode = Node<AgentNodeData>;

// Type for the data transferred during a drag-and-drop operation
export interface DroppedData {
  type: 'agent' | 'tool';

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any; // Can be agent details or a full Tool object
}