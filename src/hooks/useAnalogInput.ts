import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ZMKCustomSubsystem,
  ZMKAppContext,
} from "@cormoran/zmk-studio-react-hook";
import {
  AnalogRole,
  AnalogResponseCurve,
  Request,
  Response,
  Notification,
  type AnalogAxisConfig,
  type AnalogAxisValue,
  type AnalogInputDevice,
} from "../proto/dya/analog_input/analog_input";

export { AnalogRole };
export { AnalogResponseCurve };
export type { AnalogAxisConfig, AnalogAxisValue, AnalogInputDevice };

const SUBSYSTEM_IDENTIFIER = "dya_analog_input";

export interface UseAnalogInputReturn {
  isAvailable: boolean;
  devices: AnalogInputDevice[];
  isLoading: boolean;
  error: string | null;
  loadDevices: () => Promise<void>;
  setSamplingHz: (id: number, value: number) => Promise<void>;
  setReportInterval: (id: number, valueMs: number) => Promise<void>;
  setAxisConfig: (deviceId: number, axis: AnalogAxisConfig) => Promise<void>;
  resetDevice: (id: number) => Promise<void>;
  getValues: (id: number) => Promise<{
    values: AnalogAxisValue[];
    sampledAtMs: number;
  } | null>;
}

function replaceDevice(
  devices: AnalogInputDevice[],
  next: AnalogInputDevice,
): AnalogInputDevice[] {
  const index = devices.findIndex((device) => device.id === next.id);
  if (index === -1) return [...devices, next];
  const updated = [...devices];
  updated[index] = next;
  return updated;
}

export function useAnalogInput(): UseAnalogInputReturn {
  const zmkApp = useContext(ZMKAppContext);
  const [devices, setDevices] = useState<AnalogInputDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rpcQueueRef = useRef<Promise<void>>(Promise.resolve());

  const subsystem = useMemo(
    () => zmkApp?.findSubsystem(SUBSYSTEM_IDENTIFIER),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zmkApp?.state.customSubsystems],
  );
  const subsystemIndex = subsystem?.index;

  const callSubsystem = useCallback(
    async (request: Request): Promise<Response | null> => {
      const execute = async (): Promise<Response | null> => {
        if (!zmkApp?.state.connection || subsystemIndex === undefined) {
          setError("Analog input subsystem is not available");
          return null;
        }

        const service = new ZMKCustomSubsystem(
          zmkApp.state.connection,
          subsystemIndex,
        );
        const payload = Request.encode(Request.create(request)).finish();
        const responsePayload = await service.callRPC(payload);
        if (!responsePayload) return null;

        const response = Response.decode(responsePayload);
        if (response.error) {
          setError(response.error.message);
          return null;
        }
        return response;
      };

      const queued = rpcQueueRef.current.catch(() => undefined).then(execute);
      rpcQueueRef.current = queued.then(
        () => undefined,
        () => undefined,
      );
      return queued;
    },
    [zmkApp?.state.connection, subsystemIndex],
  );

  useEffect(() => {
    if (!zmkApp || subsystemIndex === undefined) return;

    const unsubscribe = zmkApp.onNotification({
      type: "custom",
      subsystemIndex,
      callback: (customNotification) => {
        try {
          const notification = Notification.decode(customNotification.payload);
          const device = notification.deviceChanged?.device;
          if (device) {
            setDevices((prev) => replaceDevice(prev, device));
          }
        } catch (err) {
          console.error("Failed to decode analog input notification:", err);
        }
      },
    });

    return () => unsubscribe();
  }, [zmkApp, subsystemIndex]);

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await callSubsystem({ listDevices: {} });
      if (response?.listDevices) {
        setDevices(response.listDevices.devices);
      }
    } catch (err) {
      console.error("Failed to load analog input devices:", err);
      setError(
        `Failed to load analog input devices: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [callSubsystem]);

  const updateDeviceOptimistically = useCallback(
    (id: number, update: (device: AnalogInputDevice) => AnalogInputDevice) => {
      setDevices((prev) =>
        prev.map((device) => (device.id === id ? update(device) : device)),
      );
    },
    [],
  );

  const setSamplingHz = useCallback(
    async (id: number, value: number) => {
      setIsLoading(true);
      setError(null);
      updateDeviceOptimistically(id, (device) => ({
        ...device,
        samplingHz: value,
      }));
      try {
        await callSubsystem({ setSamplingHz: { id, value } });
      } catch (err) {
        setError(
          `Failed to set sampling rate: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [callSubsystem, updateDeviceOptimistically],
  );

  const setReportInterval = useCallback(
    async (id: number, valueMs: number) => {
      setIsLoading(true);
      setError(null);
      updateDeviceOptimistically(id, (device) => ({
        ...device,
        reportIntervalMs: valueMs,
      }));
      try {
        await callSubsystem({ setReportInterval: { id, valueMs } });
      } catch (err) {
        setError(
          `Failed to set report interval: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [callSubsystem, updateDeviceOptimistically],
  );

  const setAxisConfig = useCallback(
    async (deviceId: number, axis: AnalogAxisConfig) => {
      setIsLoading(true);
      setError(null);
      updateDeviceOptimistically(deviceId, (device) => ({
        ...device,
        axes: device.axes.map((current) =>
          current.axisIndex === axis.axisIndex ? axis : current,
        ),
      }));
      try {
        await callSubsystem({ setAxisConfig: { deviceId, axis } });
      } catch (err) {
        setError(
          `Failed to set analog axis: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [callSubsystem, updateDeviceOptimistically],
  );

  const resetDevice = useCallback(
    async (id: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await callSubsystem({ resetDevice: { id } });
        if (response?.resetDevice) await loadDevices();
      } catch (err) {
        setError(
          `Failed to reset analog device: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [callSubsystem, loadDevices],
  );

  const getValues = useCallback(
    async (id: number) => {
      try {
        const response = await callSubsystem({ getValues: { id } });
        if (!response?.getValues) return null;
        return response.getValues;
      } catch (err) {
        console.error("Failed to get analog values:", err);
        setError(
          `Failed to get analog values: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
        return null;
      }
    },
    [callSubsystem],
  );

  useEffect(() => {
    if (subsystemIndex !== undefined && zmkApp?.state.connection) {
      loadDevices();
    }
  }, [subsystemIndex, zmkApp?.state.connection, loadDevices]);

  return {
    isAvailable: subsystemIndex !== undefined,
    devices,
    isLoading,
    error,
    loadDevices,
    setSamplingHz,
    setReportInterval,
    setAxisConfig,
    resetDevice,
    getValues,
  };
}
