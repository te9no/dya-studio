import type { ReactNode } from "react";
import { createContext, useState, useCallback } from "react";

// Web Serial API types (not included in standard TypeScript lib)
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
}

interface Serial {
  requestPort(): Promise<SerialPort>;
}

declare global {
  interface Navigator {
    serial?: Serial;
  }
}

// Simple connection context for UI components
interface ConnectionContextValue {
  isConnected: boolean;
  deviceName: string | undefined;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
  error: string | null;
}

const ConnectionContext = createContext<ConnectionContextValue>({
  isConnected: false,
  deviceName: undefined,
  onConnect: () => {},
  onDisconnect: () => {},
  isLoading: false,
  error: null,
});

interface DeviceConnectionProviderProps {
  children: ReactNode;
}

// TODO: Replace with actual ZMK connection when library is properly resolved
// import { ZMKConnection, ZMKAppContext } from '@cormoran/zmk-studio-react-hook';
// import { connect as connectSerial } from '@zmkfirmware/zmk-studio-ts-client/transport/serial';

export function DeviceConnectionProvider({
  children,
}: DeviceConnectionProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | undefined>(undefined);

  const handleConnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Web Serial API is available
      if (!navigator.serial) {
        throw new Error("Web Serial API is not supported in this browser");
      }

      // Request serial port access
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      // For now, mock the connection success
      // TODO: Implement actual ZMK protocol communication
      setDeviceName("DYA Keyboard");
      setIsConnected(true);

      // Store port reference for later use
      (window as unknown as { __zmkPort?: SerialPort }).__zmkPort = port;
    } catch (err) {
      if (err instanceof Error && err.name !== "NotFoundError") {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      const port = (window as unknown as { __zmkPort?: SerialPort }).__zmkPort;
      if (port) {
        await port.close();
        delete (window as unknown as { __zmkPort?: SerialPort }).__zmkPort;
      }
    } catch {
      // Ignore close errors
    }
    setIsConnected(false);
    setDeviceName(undefined);
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        deviceName,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        isLoading,
        error,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export { ConnectionContext };
