import { useState, useEffect, useCallback, useRef } from 'react';

// Real-time data simulation hook
interface RealtimeDataOptions {
  updateInterval?: number; // milliseconds
  minValue?: number;
  maxValue?: number;
  variance?: number;
  trend?: 'up' | 'down' | 'stable' | 'random';
  enabled?: boolean;
}

interface RealtimeDataResult {
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  isUpdating: boolean;
  lastUpdate: Date;
  forceUpdate: () => void;
}

export function useRealtimeNumber({
  updateInterval = 2000,
  minValue = 0,
  maxValue = 100,
  variance = 5,
  trend = 'stable',
  enabled = true
}: RealtimeDataOptions = {}): RealtimeDataResult {
  const [value, setValue] = useState<number>((minValue + maxValue) / 2);
  const [previousValue, setPreviousValue] = useState<number>(value);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateNextValue = useCallback((current: number): number => {
    let nextValue: number;

    switch (trend) {
      case 'up':
        nextValue = current + (Math.random() * variance * 0.8);
        break;
      case 'down':
        nextValue = current - (Math.random() * variance * 0.8);
        break;
      case 'stable':
        nextValue = current + (Math.random() - 0.5) * variance * 0.3;
        break;
      case 'random':
      default:
        nextValue = current + (Math.random() - 0.5) * variance;
        break;
    }

    // Clamp within bounds
    return Math.max(minValue, Math.min(maxValue, nextValue));
  }, [minValue, maxValue, variance, trend]);

  const forceUpdate = useCallback(() => {
    setIsUpdating(true);
    setPreviousValue(value);

    const newValue = generateNextValue(value);
    setValue(newValue);
    setLastUpdate(new Date());

    setTimeout(() => setIsUpdating(false), 300);
  }, [value, generateNextValue]);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      setIsUpdating(true);
      setPreviousValue(value);

      const newValue = generateNextValue(value);
      setValue(newValue);
      setLastUpdate(new Date());

      setTimeout(() => setIsUpdating(false), 300);
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval, enabled, generateNextValue, value]);

  const change = value - previousValue;
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const trendDirection: 'up' | 'down' | 'stable' =
    Math.abs(changePercent) < 0.1 ? 'stable' : changePercent > 0 ? 'up' : 'down';

  return {
    value,
    previousValue,
    change,
    changePercent,
    trend: trendDirection,
    isUpdating,
    lastUpdate,
    forceUpdate
  };
}

// Real-time telemetry data hook
interface TelemetryData {
  cpu: number;
  memory: number;
  latency: number;
  throughput: number;
  errors: number;
  uptime: number;
}

interface TelemetryResult {
  data: TelemetryData;
  isUpdating: boolean;
  lastUpdate: Date;
}

export function useRealtimeTelemetry(updateInterval: number = 1000): TelemetryResult {
  const [data, setData] = useState<TelemetryData>({
    cpu: 45,
    memory: 62,
    latency: 0.11,
    throughput: 1250,
    errors: 0,
    uptime: 99.97
  });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);

      setData(prev => ({
        cpu: Math.max(20, Math.min(85, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(40, Math.min(80, prev.memory + (Math.random() - 0.5) * 5)),
        latency: Math.max(0.05, Math.min(0.5, prev.latency + (Math.random() - 0.5) * 0.05)),
        throughput: Math.max(800, Math.min(2000, prev.throughput + (Math.random() - 0.5) * 200)),
        errors: Math.max(0, prev.errors + (Math.random() > 0.95 ? 1 : 0) * (Math.random() > 0.5 ? -1 : 0)),
        uptime: Math.max(95, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.01))
      }));

      setLastUpdate(new Date());
      setTimeout(() => setIsUpdating(false), 200);
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return { data, isUpdating, lastUpdate };
}

// Real-time log stream hook
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
}

export function useRealtimeLogs(maxEntries: number = 50): {
  logs: LogEntry[];
  addLog: (level: LogEntry['level'], source: string, message: string) => void;
  clearLogs: () => void;
} {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((level: LogEntry['level'], source: string, message: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      source,
      message
    };

    setLogs(prev => [newLog, ...prev].slice(0, maxEntries));
  }, [maxEntries]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Auto-generate some logs for demo
  useEffect(() => {
    const logSources = ['PHYSICS_ENGINE', 'mHC-GNN', 'CONSENSUS', 'DATA_INGEST', 'SAFETY_MONITOR'];
    const logMessages = [
      'Processing wellbore data batch',
      'Verifying thermodynamic constraints',
      'Applying Birkhoff projection',
      'Consensus agreement reached',
      'Safety bounds verified',
      'Neural layer attention peak',
      'Sinkhorn-Knopp projection success',
      'WITSML data normalized',
      'Geometric invariant enforced',
      'MAWP pressure bounds verified'
    ];

    const interval = setInterval(() => {
      const level = Math.random() > 0.9 ? (Math.random() > 0.5 ? 'warning' : 'error') : (Math.random() > 0.7 ? 'success' : 'info');
      const source = logSources[Math.floor(Math.random() * logSources.length)];
      const message = logMessages[Math.floor(Math.random() * logMessages.length)];

      addLog(level, source, message);
    }, 3000);

    return () => clearInterval(interval);
  }, [addLog]);

  return { logs, addLog, clearLogs };
}

// Real-time well status simulation
interface WellStatus {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  pressure: number;
  temperature: number;
  flowRate: number;
  lastUpdate: Date;
}

export function useRealtimeWellStatus(wellCount: number = 12): {
  wells: WellStatus[];
  updateWell: (id: string, updates: Partial<WellStatus>) => void;
} {
  const [wells, setWells] = useState<WellStatus[]>(() =>
    Array.from({ length: wellCount }, (_, i) => ({
      id: `well-${i + 1}`,
      name: `Well ${String.fromCharCode(65 + i)}-${Math.floor(Math.random() * 10) + 1}`,
      status: Math.random() > 0.9 ? 'warning' : 'operational',
      pressure: Math.random() * 5000 + 2000,
      temperature: Math.random() * 100 + 50,
      flowRate: Math.random() * 1000 + 500,
      lastUpdate: new Date()
    }))
  );

  const updateWell = useCallback((id: string, updates: Partial<WellStatus>) => {
    setWells(prev => prev.map(well =>
      well.id === id
        ? { ...well, ...updates, lastUpdate: new Date() }
        : well
    ));
  }, []);

  // Auto-update random wells
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * wells.length);
      const well = wells[randomIndex];

      updateWell(well.id, {
        pressure: Math.max(1000, Math.min(8000, well.pressure + (Math.random() - 0.5) * 500)),
        temperature: Math.max(30, Math.min(150, well.temperature + (Math.random() - 0.5) * 10)),
        flowRate: Math.max(200, Math.min(1500, well.flowRate + (Math.random() - 0.5) * 100)),
        status: Math.random() > 0.95 ? (Math.random() > 0.5 ? 'warning' : 'critical') : 'operational'
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [wells, updateWell]);

  return { wells, updateWell };
}