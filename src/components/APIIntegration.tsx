import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IndustrialPanel } from './IndustrialPanel';
import { ProgressiveDisclosurePanel } from './ProgressiveDisclosurePanel';
import { IndustrialButton } from './IndustrialButton';

// API Integration Examples and Patterns

// WebSocket Connection Hook
interface WebSocketHookOptions {
  url: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  reconnectInterval = 3000
}: WebSocketHookOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        onConnect?.();

        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        onMessage?.(data);
      };

      ws.onerror = (event) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', event);
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Attempt reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      };

      return ws;
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  }, [url, onMessage, onConnect, onDisconnect, reconnectInterval]);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  return { isConnected, lastMessage, error };
}

// REST API Hook
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRestApi<T>(url: string): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// GraphQL API Hook
interface GraphQLResponse<T> {
  data: T | null;
  errors?: Array<{ message: string }>;
}

export function useGraphQL<T>(
  query: string,
  variables?: Record<string, any>
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraphQL = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({ query, variables })
      });

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map(e => e.message).join(', '));
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GraphQL error');
      console.error('GraphQL error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, variables]);

  useEffect(() => {
    fetchGraphQL();
  }, [fetchGraphQL]);

  return { data, loading, error, refetch: fetchGraphQL };
}

// API Integration Demo Component
export function APIIntegrationDemo() {
  const [activeConnection, setActiveConnection] = useState<'rest' | 'websocket' | 'graphql'>('rest');
  const [mockData, setMockData] = useState<any>(null);

  // Simulated WebSocket connection
  const { isConnected: wsConnected, lastMessage: wsMessage } = useWebSocket({
    url: 'ws://localhost:8080/realtime',
    onMessage: (data) => {
      console.log('WebSocket message:', data);
    },
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    }
  });

  // Simulate REST API call
  const { data: restData, loading: restLoading, error: restError, refetch: restRefetch } = useRestApi<any>('/api/wells/status');

  // Simulate GraphQL query
  const { data: graphqlData, loading: graphqlLoading } = useGraphQL<any>(
    `query GetSystemStatus {
      systemStatus {
        cpu
        memory
        uptime
        activeWells
      }
    }`
  );

  // Simulate mock data generation
  useEffect(() => {
    const interval = setInterval(() => {
      setMockData({
        timestamp: new Date().toISOString(),
        wells: Math.floor(Math.random() * 50) + 100,
        alerts: Math.floor(Math.random() * 5),
        performance: {
          fps: Math.floor(Math.random() * 10) + 55,
          latency: Math.random() * 50 + 20
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-6 bg-teal-500 rounded-sm" />
          <h2 className="text-2xl font-bold text-white font-display-industrial">
            API Integration Examples
          </h2>
        </div>
        <p className="text-sm text-slate-400 ml-4">
          Comprehensive API integration patterns with WebSocket, REST, and GraphQL
        </p>
      </div>

      {/* Connection Type Selector */}
      <div className="flex gap-3">
        {(['rest', 'websocket', 'graphql'] as const).map((type) => (
          <IndustrialButton
            key={type}
            variant={activeConnection === type ? 'primary' : 'default'}
            onClick={() => setActiveConnection(type)}
            icon={type === 'rest' ? '🌐' : type === 'websocket' ? '🔌' : '📊'}
          >
            {type.toUpperCase()}
          </IndustrialButton>
        ))}
      </div>

      {/* REST API Example */}
      {activeConnection === 'rest' && (
        <div className="grid md:grid-cols-2 gap-6">
          <ProgressiveDisclosurePanel
            title="REST API Integration"
            description="Standard REST endpoints with error handling"
            icon="🌐"
            badge="REST"
          >
            <div className="space-y-4">
              <div className="bg-slate-950 border-2 border-slate-800 rounded p-4">
                <div className="text-[10px] font-mono text-slate-600 mb-2">
                  GET /api/wells/status
                </div>
                <pre className="text-[11px] font-mono text-slate-400">
{`// Example Response
{
  "wells": [
    {
      "id": "well-001",
      "name": "North Sea Alpha-4",
      "status": "operational",
      "pressure": 3500.5,
      "temperature": 85.2,
      "flowRate": 1200.0
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-600">Status</span>
                  <span className={restLoading ? 'text-amber-400' : restError ? 'text-rose-400' : 'text-emerald-400'}>
                    {restLoading ? 'Loading...' : restError ? 'Error' : 'Connected'}
                  </span>
                </div>
                <IndustrialButton
                  variant="primary"
                  size="sm"
                  onClick={() => restRefetch()}
                  icon="🔄"
                >
                  Refetch Data
                </IndustrialButton>
              </div>
            </div>
          </ProgressiveDisclosurePanel>

          <ProgressiveDisclosurePanel
            title="REST Code Example"
            description="TypeScript implementation pattern"
            icon="💻"
            badge="CODE"
          >
            <pre className="text-[10px] font-mono text-slate-400 leading-relaxed">
{`// REST API Hook
function useRestApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}`}
            </pre>
          </ProgressiveDisclosurePanel>
        </div>
      )}

      {/* WebSocket Example */}
      {activeConnection === 'websocket' && (
        <div className="grid md:grid-cols-2 gap-6">
          <ProgressiveDisclosurePanel
            title="WebSocket Connection"
            description="Real-time bidirectional communication"
            icon="🔌"
            badge="REALTIME"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950/50 border-2 border-slate-800 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="text-[10px] font-mono text-slate-400">
                    {wsConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-600">
                  ws://localhost:8080/realtime
                </div>
              </div>

              {wsMessage && (
                <div className="bg-slate-950 border-2 border-slate-800 rounded p-4">
                  <div className="text-[10px] font-mono text-slate-600 mb-2">
                    Latest Message
                  </div>
                  <pre className="text-[11px] font-mono text-slate-400">
                    {JSON.stringify(wsMessage, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </ProgressiveDisclosurePanel>

          <ProgressiveDisclosurePanel
            title="WebSocket Code Example"
            description="Implementation with auto-reconnect"
            icon="💻"
            badge="CODE"
          >
            <pre className="text-[10px] font-mono text-slate-400 leading-relaxed">
{`// WebSocket Hook with Reconnect
function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = () => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto reconnect after 3s
      setTimeout(connect, 3000);
    };

    return ws;
  };

  useEffect(() => {
    const ws = connect();
    return () => ws?.close();
  }, [url]);

  return { isConnected, lastMessage };
}`}
            </pre>
          </ProgressiveDisclosurePanel>
        </div>
      )}

      {/* GraphQL Example */}
      {activeConnection === 'graphql' && (
        <div className="grid md:grid-cols-2 gap-6">
          <ProgressiveDisclosurePanel
            title="GraphQL Integration"
            description="Flexible queries with type safety"
            icon="📊"
            badge="GRAPHQL"
          >
            <div className="space-y-4">
              <div className="bg-slate-950 border-2 border-slate-800 rounded p-4">
                <div className="text-[10px] font-mono text-slate-600 mb-2">
                  Query Example
                </div>
                <pre className="text-[11px] font-mono text-slate-400">
{`query GetSystemStatus {
  systemStatus {
    cpu
    memory
    uptime
    activeWells
  }
}`}
                </pre>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${graphqlLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-mono text-slate-400">
                  {graphqlLoading ? 'Loading...' : 'Ready'}
                </span>
              </div>
            </div>
          </ProgressiveDisclosurePanel>

          <ProgressiveDisclosurePanel
            title="GraphQL Code Example"
            description="Type-safe GraphQL implementation"
            icon="💻"
            badge="CODE"
          >
            <pre className="text-[10px] font-mono text-slate-400 leading-relaxed">
{`// GraphQL Hook
function useGraphQL<T>(
  query: string,
  variables?: Record<string, any>
) {
  const [data, setData] = useState<T | null>(null);

  const fetchGraphQL = async () => {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    setData(result.data);
  };

  useEffect(() => { fetchGraphQL(); }, [query]);
  return { data, loading: false, refetch: fetchGraphQL };
}`}
            </pre>
          </ProgressiveDisclosurePanel>
        </div>
      )}

      {/* Live Mock Data Display */}
      {mockData && (
        <IndustrialPanel variant="teal" size="md" showCorners showGrid>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-600 mb-1">
                LIVE MOCK DATA STREAM
              </div>
              <div className="text-sm font-mono text-slate-400">
                Updated: {new Date(mockData.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-xl font-mono text-teal-400 tabular-nums">
                  {mockData.wells}
                </div>
                <div className="text-[9px] font-mono text-slate-600">WELLS</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-mono text-amber-400 tabular-nums">
                  {mockData.alerts}
                </div>
                <div className="text-[9px] font-mono text-slate-600">ALERTS</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-mono text-emerald-400 tabular-nums">
                  {mockData.performance.fps}
                </div>
                <div className="text-[9px] font-mono text-slate-600">FPS</div>
              </div>
            </div>
          </div>
        </IndustrialPanel>
      )}
    </div>
  );
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class APIErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('API Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-rose-500/10 border-2 border-rose-500/40 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="text-lg font-semibold text-rose-400">
                  API Error Detected
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded text-sm font-mono text-rose-400"
            >
              Retry Connection
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}