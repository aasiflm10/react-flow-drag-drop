import { ReactFlowProvider } from '@xyflow/react';
import Sidebar from './components/Sidebar';
import FlowCanvas from './components/FlowCanvas';
import type { Tool } from './types';

// Mock data for the tools, as in the original code
const tools: Tool[] = [
  { id: 'tool-1', name: 'bulk-doc-check', description: 'Helps in organizing data...' },
  { id: 'tool-2', name: 'data-analytics-tool', description: 'Clear actionable items...' },
  { id: 'tool-3', name: 'web-search-tool', description: 'For web-based searches...' },
  { id: 'tool-4', name: 'ticket-classification', description: 'Classifies support tickets...' },
];

export default function App() {
  return (
    <main className="flex h-screen w-screen bg-[#1E1E1E]">
      <ReactFlowProvider>
        <Sidebar tools={tools} />
        <FlowCanvas />
      </ReactFlowProvider>
    </main>
  );
}