import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import {
  ZMKCustomSubsystem,
  ZMKAppContext,
} from "@cormoran/zmk-studio-react-hook";
import {
  Request,
  Response,
  Notification,
  BatteryHistoryNotification,
} from "../proto/zmk/battery_history/battery_history";

// Subsystem identifier for ZMK battery history custom protocol
const SUBSYSTEM_IDENTIFIER = "zmk__battery_history";

export interface BatteryHistoryEntryData {
  timestamp: number;
  batteryLevel: number;
}

export interface DeviceBatteryHistory {
  sourceId: number;
  deviceName: string;
  entries: BatteryHistoryEntryData[];
  totalEntries: number;
  lastEntryLoaded: boolean;
}

export interface UseBatteryHistoryReturn {
  isAvailable: boolean;
  devices: DeviceBatteryHistory[];
  isLoading: boolean;
  error: string | null;
  loadBatteryHistory: () => Promise<void>;
  clearBatteryHistory: () => Promise<void>;
}

export function useBatteryHistory(): UseBatteryHistoryReturn {
  const zmkApp = useContext(ZMKAppContext);
  const [deviceMap, setDeviceMap] = useState<Map<number, DeviceBatteryHistory>>(
    new Map(),
  );

  const devices = useMemo(() => Array.from(deviceMap.values()), [deviceMap]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize subsystem to avoid unnecessary re-renders
  const subsystem = useMemo(
    () => zmkApp?.findSubsystem(SUBSYSTEM_IDENTIFIER),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zmkApp?.state.customSubsystems],
  );

  const notificationHandler = useCallback(
    (notification: BatteryHistoryNotification) => {
      try {
        const { sourceId, entry } = notification;
        if (!entry) {
          return;
        }
        setDeviceMap((prevMap) => {
          const device = prevMap.get(sourceId) || {
            sourceId,
            deviceName: sourceId === 0 ? "Central" : `Peripheral ${sourceId}`,
            entries: [],
            totalEntries: notification.totalEntries || 0,
            lastEntryLoaded: notification.isLast || false,
          };
          const newDevice = {
            ...device,
            entries: [
              ...device.entries,
              {
                timestamp: entry.timestamp,
                batteryLevel: entry.batteryLevel,
              },
            ],
          };
          if (newDevice.totalEntries != notification.totalEntries) {
            console.warn(
              `Total entries changed for device ${sourceId}: ${newDevice.totalEntries} -> ${notification.totalEntries}`,
            );
            newDevice.totalEntries = notification.totalEntries || 0;
          }
          if (notification.isLast) {
            newDevice.lastEntryLoaded = true;
          }
          const newMap = new Map(prevMap);
          newMap.set(sourceId, newDevice);
          return newMap;
        });
      } catch (err) {
        console.error("Failed to process battery history notification:", err);
      }
    },
    [],
  );
  // Extract subsystem index as a stable primitive value for dependencies
  const subsystemIndex = subsystem?.index;
  useEffect(() => {
    if (!zmkApp || subsystemIndex === undefined) {
      return () => {};
    }
    return zmkApp?.onNotification({
      type: "custom",
      subsystemIndex,
      callback: (customNotification) => {
        // Decode the payload
        try {
          const notification = Notification.decode(customNotification.payload);
          if (notification.batteryHistory) {
            notificationHandler(notification.batteryHistory);
          }
        } catch (err) {
          console.error("Failed to decode battery history notification:", err);
        }
      },
    });
  }, [zmkApp, subsystemIndex, notificationHandler]);

  const loadBatteryHistory = useCallback(async () => {
    if (!zmkApp?.state.connection || subsystemIndex === undefined) {
      setError("Not connected to device or subsystem not found");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDeviceMap(new Map());

    try {
      const service = new ZMKCustomSubsystem(
        zmkApp.state.connection,
        subsystemIndex,
      );
      // Send request to get battery history
      const request = Request.create({
        getHistory: {},
      });

      const payload = Request.encode(request).finish();
      const responsePayload = await service.callRPC(payload);

      if (responsePayload) {
        const resp = Response.decode(responsePayload);
        if (resp.error) {
          setError(resp.error.message);
        }
        // Note: The actual data comes via notifications, not the response
      }
    } catch (err) {
      console.error("Failed to load battery history:", err);
      setError(
        `Failed to load battery history: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [zmkApp, subsystemIndex]);

  const clearBatteryHistory = useCallback(async () => {
    if (!zmkApp?.state.connection || subsystemIndex === undefined) return;

    setIsLoading(true);
    setError(null);

    try {
      const service = new ZMKCustomSubsystem(
        zmkApp.state.connection,
        subsystemIndex,
      );

      const request = Request.create({
        clearHistory: {},
      });

      const payload = Request.encode(request).finish();
      const responsePayload = await service.callRPC(payload);

      if (responsePayload) {
        const resp = Response.decode(responsePayload);
        if (resp.clearHistory?.entriesCleared !== undefined) {
          // Successfully cleared
          setDeviceMap(new Map());
          await loadBatteryHistory();
        } else if (resp.error) {
          setError(resp.error.message);
        }
      }
    } catch (err) {
      console.error("Failed to clear battery history:", err);
      setError(
        `Failed to clear battery history: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [zmkApp?.state.connection, subsystemIndex, loadBatteryHistory]);

  // Load battery history when connection or subsystem changes
  useEffect(() => {
    if (subsystemIndex !== undefined && zmkApp?.state.connection) {
      loadBatteryHistory();
    }
  }, [subsystemIndex, zmkApp?.state.connection, loadBatteryHistory]);

  return {
    isAvailable: subsystemIndex !== undefined,
    devices,
    isLoading,
    error,
    loadBatteryHistory,
    clearBatteryHistory,
  };
}
