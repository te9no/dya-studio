/**
 * Demo RPC Transport
 * 
 * Simulates a ZMK keyboard connection for testing without a physical device.
 */

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { Request, Response } from "@zmkfirmware/zmk-studio-ts-client";

// Framing protocol
const SOF = 0xab;
const EOF = 0xad;
const ESC = 0xac;

/**
 * Demo keyboard data
 */
const DEMO = {
  device: { name: "DYA Keyboard (Demo)", version: "1.0.0" },
  layouts: {
    activeLayoutIndex: 0,
    layouts: [{
      name: "Default",
      keys: Array(42).fill(0).map((_, i) => ({
        width: 100, height: 100,
        x: (i >= 21 ? 750 : 0) + (i % 21 % 6) * 110,
        y: Math.floor((i % 21) / 6) * 110,
        r: 0, rx: 0, ry: 0
      }))
    }]
  },
  keymap: {
    layers: [
      { id: 0, name: "Base", bindings: Array(42).fill({ behaviorId: 1, param1: 0x04, param2: 0 }) },
      { id: 1, name: "Lower", bindings: Array(42).fill({ behaviorId: 2, param1: 0, param2: 0 }) },
      { id: 2, name: "Raise", bindings: Array(42).fill({ behaviorId: 2, param1: 0, param2: 0 }) },
    ],
    availableLayers: 8,
    maxLayerNameLength: 32,
  },
  behaviors: [
    { id: 1, displayName: "kp", metadata: [] },
    { id: 2, displayName: "trans", metadata: [] },
    { id: 3, displayName: "kp", metadata: [] },
    { id: 4, displayName: "mo", metadata: [] },
  ],
};

/**
 * Frame bytes
 */
function frame(bytes: Uint8Array): Uint8Array {
  const result: number[] = [SOF];
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === SOF || b === EOF || b === ESC) {
      result.push(ESC);
    }
    result.push(b);
  }
  result.push(EOF);
  return new Uint8Array(result);
}

/**
 * Demo keyboard
 */
class Keyboard {
  private km = JSON.parse(JSON.stringify(DEMO.keymap));
  private dirty = false;
  private orig = JSON.parse(JSON.stringify(DEMO.keymap));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(req: any): any {
    const r = { requestId: req.requestId, requestResponse: {} };

    if (req.core?.getDeviceInfo) {
      r.requestResponse = { core: { getDeviceInfo: DEMO.device } };
    } else if (req.keymap?.getPhysicalLayouts) {
      r.requestResponse = { keymap: { getPhysicalLayouts: DEMO.layouts } };
    } else if (req.keymap?.getKeymap) {
      r.requestResponse = { keymap: { getKeymap: this.km } };
    } else if (req.keymap?.checkUnsavedChanges !== undefined) {
      r.requestResponse = { keymap: { checkUnsavedChanges: this.dirty } };
    } else if (req.keymap?.setLayerBinding) {
      const { layerId, keyPosition, binding } = req.keymap.setLayerBinding;
      const layer = this.km.layers.find((l: { id: number }) => l.id === layerId);
      if (layer && keyPosition >= 0 && keyPosition < 42) {
        layer.bindings[keyPosition] = binding;
        this.dirty = true;
        r.requestResponse = { keymap: { setLayerBinding: 0 } };
      } else {
        r.requestResponse = { keymap: { setLayerBinding: 1 } };
      }
    } else if (req.keymap?.saveChanges !== undefined) {
      this.orig = JSON.parse(JSON.stringify(this.km));
      this.dirty = false;
      r.requestResponse = { keymap: { saveChanges: { ok: {} } } };
    } else if (req.keymap?.discardChanges !== undefined) {
      this.km = JSON.parse(JSON.stringify(this.orig));
      this.dirty = false;
      r.requestResponse = { keymap: { discardChanges: true } };
    } else if (req.behaviors?.listAllBehaviors) {
      r.requestResponse = { behaviors: { listAllBehaviors: { behaviors: [1, 2, 3, 4] } } };
    } else if (req.behaviors?.getBehaviorDetails) {
      const b = DEMO.behaviors.find(x => x.id === req.behaviors.getBehaviorDetails.behaviorId);
      r.requestResponse = { behaviors: { getBehaviorDetails: b || DEMO.behaviors[0] } };
    }

    return r;
  }
}

/**
 * Connect to demo keyboard
 */
export async function connect(): Promise<RpcTransport> {
  const abort = new AbortController();
  const kb = new Keyboard();

  // Buffer for accumulating bytes across chunks
  let buffer: number[] = [];
  let escaped = false;
  let inFrame = false;

  const tx = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctrl) {
      try {
        // Process each byte
        for (let i = 0; i < chunk.length; i++) {
          const b = chunk[i];

          if (escaped) {
            buffer.push(b);
            escaped = false;
          } else if (b === SOF) {
            // Start of frame
            buffer = [];
            inFrame = true;
          } else if (b === EOF && inFrame) {
            // End of frame - process it
            if (buffer.length > 0) {
              const frameBytes = new Uint8Array(buffer);
              const req = Request.decode(frameBytes);
              const res = kb.process(req);
              const encoded = Response.encode(res).finish();
              const framed = frame(encoded);
              ctrl.enqueue(framed);
            }
            buffer = [];
            inFrame = false;
          } else if (b === ESC) {
            escaped = true;
          } else if (inFrame) {
            buffer.push(b);
          }
        }
      } catch (e) {
        console.error("Demo error:", e);
      }
    }
  });

  return {
    label: "Demo",
    abortController: abort,
    readable: tx.readable,
    writable: tx.writable,
  };
}
