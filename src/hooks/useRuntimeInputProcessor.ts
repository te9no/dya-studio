import { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { ZMKCustomSubsystem, ZMKAppContext } from "@cormoran/zmk-studio-react-hook";
import {
  Request,
  Response,
  ProcessorInfo,
} from "../proto/zmk/runtime_input_processor/runtime_input_processor";

// Subsystem identifier for ZMK runtime input processor custom protocol
// This matches the identifier registered in the ZMK firmware module
const SUBSYSTEM_IDENTIFIER = "zmk__runtime_input_processor";

export interface InputProcessor {
  name: string;
  scaleMultiplier: number;
  scaleDivisor: number;
  rotationDegrees: number;
}

export interface UseRuntimeInputProcessorReturn {
  processors: InputProcessor[];
  isLoading: boolean;
  error: string | null;
  loadProcessors: () => Promise<void>;
  setScaling: (name: string, multiplier: number, divisor: number) => Promise<void>;
  setRotation: (name: string, degrees: number) => Promise<void>;
}

export function useRuntimeInputProcessor(): UseRuntimeInputProcessorReturn {
  const zmkApp = useContext(ZMKAppContext);
  const [processors, setProcessors] = useState<InputProcessor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize subsystem to avoid unnecessary re-renders
  const subsystem = useMemo(
    () => zmkApp?.findSubsystem(SUBSYSTEM_IDENTIFIER),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zmkApp?.state.customSubsystems]
  );

  // Extract subsystem index as a stable primitive value for dependencies
  const subsystemIndex = subsystem?.index;

  const loadProcessors = useCallback(async () => {
    if (!zmkApp?.state.connection || subsystemIndex === undefined) {
      setError("Not connected to device or subsystem not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = new ZMKCustomSubsystem(
        zmkApp.state.connection,
        subsystemIndex
      );

      const request = Request.create({
        listProcessors: {},
      });

      const payload = Request.encode(request).finish();
      const responsePayload = await service.callRPC(payload);

      if (responsePayload) {
        const resp = Response.decode(responsePayload);
        if (resp.listProcessors) {
          const processors = resp.listProcessors.processors.map((p: ProcessorInfo) => ({
            name: p.name,
            scaleMultiplier: p.scaleMultiplier,
            scaleDivisor: p.scaleDivisor,
            rotationDegrees: p.rotationDegrees,
          }));
          setProcessors(processors);
        } else if (resp.error) {
          setError(resp.error.message);
        }
      }
    } catch (err) {
      console.error("Failed to load processors:", err);
      setError(
        `Failed to load processors: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [zmkApp?.state.connection, subsystemIndex]);

  const setScaling = useCallback(
    async (name: string, multiplier: number, divisor: number) => {
      if (!zmkApp?.state.connection || subsystemIndex === undefined) return;

      setIsLoading(true);
      setError(null);

      try {
        const service = new ZMKCustomSubsystem(
          zmkApp.state.connection,
          subsystemIndex
        );

        const request = Request.create({
          setScaling: {
            name,
            scaleMultiplier: multiplier,
            scaleDivisor: divisor,
          },
        });

        const payload = Request.encode(request).finish();
        const responsePayload = await service.callRPC(payload);

        if (responsePayload) {
          const resp = Response.decode(responsePayload);
          if (resp.setScaling?.success) {
            await loadProcessors();
          } else if (resp.error) {
            setError(resp.error.message);
          } else {
            setError("Failed to set scaling");
          }
        }
      } catch (err) {
        console.error("Failed to set scaling:", err);
        setError(
          `Failed to set scaling: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [zmkApp?.state.connection, subsystemIndex, loadProcessors]
  );

  const setRotation = useCallback(
    async (name: string, degrees: number) => {
      if (!zmkApp?.state.connection || subsystemIndex === undefined) return;

      setIsLoading(true);
      setError(null);

      try {
        const service = new ZMKCustomSubsystem(
          zmkApp.state.connection,
          subsystemIndex
        );

        const request = Request.create({
          setRotation: {
            name,
            rotationDegrees: degrees,
          },
        });

        const payload = Request.encode(request).finish();
        const responsePayload = await service.callRPC(payload);

        if (responsePayload) {
          const resp = Response.decode(responsePayload);
          if (resp.setRotation?.success) {
            await loadProcessors();
          } else if (resp.error) {
            setError(resp.error.message);
          } else {
            setError("Failed to set rotation");
          }
        }
      } catch (err) {
        console.error("Failed to set rotation:", err);
        setError(
          `Failed to set rotation: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [zmkApp?.state.connection, subsystemIndex, loadProcessors]
  );

  // Load processors when connection or subsystem changes
  useEffect(() => {
    if (subsystemIndex !== undefined && zmkApp?.state.connection) {
      loadProcessors();
    }
  }, [subsystemIndex, zmkApp?.state.connection, loadProcessors]);

  return {
    processors,
    isLoading,
    error,
    loadProcessors,
    setScaling,
    setRotation,
  };
}
