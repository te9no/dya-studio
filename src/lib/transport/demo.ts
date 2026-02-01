/**
 * Demo RPC Transport
 *
 * This transport simulates a ZMK keyboard connection for demo purposes.
 * It handles RPC requests and generates mock responses based on realistic
 * DYA keyboard data, allowing users to try the app without a physical device.
 */

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import type { Request, Response } from "@zmkfirmware/zmk-studio-ts-client";
import { Request as RequestProto, Response as ResponseProto } from "@zmkfirmware/zmk-studio-ts-client";

/**
 * Demo keyboard data
 * Represents a realistic DYA keyboard configuration
 */
const DEMO_DATA = {
  deviceInfo: {
    name: "DYA Keyboard (Demo)",
    version: "1.0.0-demo",
    id: "demo-dya-keyboard",
  },
  physicalLayouts: {
    activeLayoutIndex: 0,
    layouts: [
      {
        name: "Default",
        keys: [
          // Left half - Top row
          { width: 100, height: 100, x: 0, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 110, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 220, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 330, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 440, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 550, y: 0, r: 0, rx: 0, ry: 0 },
          // Left half - Middle row
          { width: 100, height: 100, x: 0, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 110, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 220, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 330, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 440, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 550, y: 110, r: 0, rx: 0, ry: 0 },
          // Left half - Bottom row
          { width: 100, height: 100, x: 0, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 110, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 220, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 330, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 440, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 550, y: 220, r: 0, rx: 0, ry: 0 },
          // Left half - Thumb cluster
          { width: 100, height: 100, x: 220, y: 330, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 330, y: 330, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 440, y: 330, r: 0, rx: 0, ry: 0 },

          // Right half - Top row
          { width: 100, height: 100, x: 750, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 860, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 970, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1080, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1190, y: 0, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1300, y: 0, r: 0, rx: 0, ry: 0 },
          // Right half - Middle row
          { width: 100, height: 100, x: 750, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 860, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 970, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1080, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1190, y: 110, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1300, y: 110, r: 0, rx: 0, ry: 0 },
          // Right half - Bottom row
          { width: 100, height: 100, x: 750, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 860, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 970, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1080, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1190, y: 220, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1300, y: 220, r: 0, rx: 0, ry: 0 },
          // Right half - Thumb cluster
          { width: 100, height: 100, x: 860, y: 330, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 970, y: 330, r: 0, rx: 0, ry: 0 },
          { width: 100, height: 100, x: 1080, y: 330, r: 0, rx: 0, ry: 0 },
        ],
      },
    ],
  },
  keymap: {
    layers: [
      {
        id: 0,
        name: "Base",
        bindings: [
          // Left half - Top row: ESC, Q, W, E, R, T
          { behaviorId: 1, param1: 0x29, param2: 0 }, // ESC
          { behaviorId: 1, param1: 0x14, param2: 0 }, // Q
          { behaviorId: 1, param1: 0x1a, param2: 0 }, // W
          { behaviorId: 1, param1: 0x08, param2: 0 }, // E
          { behaviorId: 1, param1: 0x15, param2: 0 }, // R
          { behaviorId: 1, param1: 0x17, param2: 0 }, // T
          // Left half - Middle row: TAB, A, S, D, F, G
          { behaviorId: 1, param1: 0x2b, param2: 0 }, // TAB
          { behaviorId: 1, param1: 0x04, param2: 0 }, // A
          { behaviorId: 1, param1: 0x16, param2: 0 }, // S
          { behaviorId: 1, param1: 0x07, param2: 0 }, // D
          { behaviorId: 1, param1: 0x09, param2: 0 }, // F
          { behaviorId: 1, param1: 0x0a, param2: 0 }, // G
          // Left half - Bottom row: LSHIFT, Z, X, C, V, B
          { behaviorId: 3, param1: 0xe1, param2: 0 }, // LSHIFT
          { behaviorId: 1, param1: 0x1d, param2: 0 }, // Z
          { behaviorId: 1, param1: 0x1b, param2: 0 }, // X
          { behaviorId: 1, param1: 0x06, param2: 0 }, // C
          { behaviorId: 1, param1: 0x19, param2: 0 }, // V
          { behaviorId: 1, param1: 0x05, param2: 0 }, // B
          // Left half - Thumb: LCTRL, SPACE, MO(1)
          { behaviorId: 3, param1: 0xe0, param2: 0 }, // LCTRL
          { behaviorId: 1, param1: 0x2c, param2: 0 }, // SPACE
          { behaviorId: 4, param1: 1, param2: 0 },    // MO(Lower)

          // Right half - Top row: Y, U, I, O, P, BSPC
          { behaviorId: 1, param1: 0x1c, param2: 0 }, // Y
          { behaviorId: 1, param1: 0x18, param2: 0 }, // U
          { behaviorId: 1, param1: 0x0c, param2: 0 }, // I
          { behaviorId: 1, param1: 0x12, param2: 0 }, // O
          { behaviorId: 1, param1: 0x13, param2: 0 }, // P
          { behaviorId: 1, param1: 0x2a, param2: 0 }, // BSPC
          // Right half - Middle row: H, J, K, L, ;, '
          { behaviorId: 1, param1: 0x0b, param2: 0 }, // H
          { behaviorId: 1, param1: 0x0d, param2: 0 }, // J
          { behaviorId: 1, param1: 0x0e, param2: 0 }, // K
          { behaviorId: 1, param1: 0x0f, param2: 0 }, // L
          { behaviorId: 1, param1: 0x33, param2: 0 }, // ;
          { behaviorId: 1, param1: 0x34, param2: 0 }, // '
          // Right half - Bottom row: N, M, ,, ., /, RSHIFT
          { behaviorId: 1, param1: 0x11, param2: 0 }, // N
          { behaviorId: 1, param1: 0x10, param2: 0 }, // M
          { behaviorId: 1, param1: 0x36, param2: 0 }, // ,
          { behaviorId: 1, param1: 0x37, param2: 0 }, // .
          { behaviorId: 1, param1: 0x38, param2: 0 }, // /
          { behaviorId: 3, param1: 0xe5, param2: 0 }, // RSHIFT
          // Right half - Thumb: MO(2), ENTER, RALT
          { behaviorId: 4, param1: 2, param2: 0 },    // MO(Raise)
          { behaviorId: 1, param1: 0x28, param2: 0 }, // ENTER
          { behaviorId: 3, param1: 0xe6, param2: 0 }, // RALT
        ],
      },
      {
        id: 1,
        name: "Lower",
        bindings: [
          // Left half - Top row: ~, !, @, #, $, %
          { behaviorId: 1, param1: 0x35, param2: 0 }, // ~
          { behaviorId: 1, param1: 0x1e, param2: 0 }, // 1 (!)
          { behaviorId: 1, param1: 0x1f, param2: 0 }, // 2 (@)
          { behaviorId: 1, param1: 0x20, param2: 0 }, // 3 (#)
          { behaviorId: 1, param1: 0x21, param2: 0 }, // 4 ($)
          { behaviorId: 1, param1: 0x22, param2: 0 }, // 5 (%)
          // Left half - Middle row: DEL, F1, F2, F3, F4, F5
          { behaviorId: 1, param1: 0x4c, param2: 0 }, // DEL
          { behaviorId: 1, param1: 0x3a, param2: 0 }, // F1
          { behaviorId: 1, param1: 0x3b, param2: 0 }, // F2
          { behaviorId: 1, param1: 0x3c, param2: 0 }, // F3
          { behaviorId: 1, param1: 0x3d, param2: 0 }, // F4
          { behaviorId: 1, param1: 0x3e, param2: 0 }, // F5
          // Left half - Bottom row: LSHIFT, F7, F8, F9, F10, F11
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS
          { behaviorId: 1, param1: 0x40, param2: 0 }, // F7
          { behaviorId: 1, param1: 0x41, param2: 0 }, // F8
          { behaviorId: 1, param1: 0x42, param2: 0 }, // F9
          { behaviorId: 1, param1: 0x43, param2: 0 }, // F10
          { behaviorId: 1, param1: 0x44, param2: 0 }, // F11
          // Left half - Thumb
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS

          // Right half - Top row: ^, &, *, (, ), BSPC
          { behaviorId: 1, param1: 0x23, param2: 0 }, // 6 (^)
          { behaviorId: 1, param1: 0x24, param2: 0 }, // 7 (&)
          { behaviorId: 1, param1: 0x25, param2: 0 }, // 8 (*)
          { behaviorId: 1, param1: 0x26, param2: 0 }, // 9 (()
          { behaviorId: 1, param1: 0x27, param2: 0 }, // 0 ())
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS
          // Right half - Middle row: LEFT, DOWN, UP, RIGHT, END, PG_UP
          { behaviorId: 1, param1: 0x50, param2: 0 }, // LEFT
          { behaviorId: 1, param1: 0x51, param2: 0 }, // DOWN
          { behaviorId: 1, param1: 0x52, param2: 0 }, // UP
          { behaviorId: 1, param1: 0x4f, param2: 0 }, // RIGHT
          { behaviorId: 1, param1: 0x4d, param2: 0 }, // END
          { behaviorId: 1, param1: 0x4b, param2: 0 }, // PG_UP
          // Right half - Bottom row: +, -, =, [, ], \
          { behaviorId: 1, param1: 0x57, param2: 0 }, // +
          { behaviorId: 1, param1: 0x2d, param2: 0 }, // -
          { behaviorId: 1, param1: 0x2e, param2: 0 }, // =
          { behaviorId: 1, param1: 0x2f, param2: 0 }, // [
          { behaviorId: 1, param1: 0x30, param2: 0 }, // ]
          { behaviorId: 1, param1: 0x31, param2: 0 }, // backslash
          // Right half - Thumb
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS
          { behaviorId: 2, param1: 0, param2: 0 },    // TRANS
        ],
      },
      {
        id: 2,
        name: "Raise",
        bindings: Array(42).fill({ behaviorId: 2, param1: 0, param2: 0 }), // All transparent
      },
    ],
    availableLayers: 8,
    maxLayerNameLength: 32,
  },
  behaviors: [
    { id: 1, displayName: "kp", metadata: [] },       // Key Press
    { id: 2, displayName: "trans", metadata: [] },    // Transparent
    { id: 3, displayName: "kp", metadata: [] },       // Modifier Key Press
    { id: 4, displayName: "mo", metadata: [] },       // Momentary Layer
  ],
};

/**
 * Internal state for the demo transport
 */
class DemoState {
  private keymap = JSON.parse(JSON.stringify(DEMO_DATA.keymap));
  private hasUnsavedChanges = false;
  private originalKeymap = JSON.parse(JSON.stringify(DEMO_DATA.keymap));

  // Handle keymap requests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleKeymapRequest(request: any): any {
    if (request.getPhysicalLayouts) {
      return { getPhysicalLayouts: DEMO_DATA.physicalLayouts };
    }

    if (request.getKeymap) {
      return { getKeymap: this.keymap };
    }

    if (request.setLayerBinding) {
      const { layerId, keyPosition, binding } = request.setLayerBinding;
      const layer = this.keymap.layers.find((l: { id: number }) => l.id === layerId);
      if (!layer) {
        return { setLayerBinding: 1 }; // INVALID_LAYER_ID
      }
      if (keyPosition < 0 || keyPosition >= layer.bindings.length) {
        return { setLayerBinding: 2 }; // INVALID_KEY_POSITION
      }
      layer.bindings[keyPosition] = binding;
      this.hasUnsavedChanges = true;
      return { setLayerBinding: 0 }; // OK
    }

    if (request.checkUnsavedChanges !== undefined) {
      return { checkUnsavedChanges: this.hasUnsavedChanges };
    }

    if (request.saveChanges !== undefined) {
      this.originalKeymap = JSON.parse(JSON.stringify(this.keymap));
      this.hasUnsavedChanges = false;
      return { saveChanges: { ok: {} } };
    }

    if (request.discardChanges !== undefined) {
      this.keymap = JSON.parse(JSON.stringify(this.originalKeymap));
      this.hasUnsavedChanges = false;
      return { discardChanges: true };
    }

    if (request.moveLayer) {
      const { startIndex, destIndex } = request.moveLayer;
      if (startIndex < 0 || startIndex >= this.keymap.layers.length) {
        return { moveLayer: { err: {} } };
      }
      if (destIndex < 0 || destIndex >= this.keymap.layers.length) {
        return { moveLayer: { err: {} } };
      }
      const [layer] = this.keymap.layers.splice(startIndex, 1);
      this.keymap.layers.splice(destIndex, 0, layer);
      this.hasUnsavedChanges = true;
      return { moveLayer: { ok: this.keymap } };
    }

    if (request.addLayer !== undefined) {
      if (this.keymap.layers.length >= this.keymap.availableLayers) {
        return { addLayer: { err: {} } };
      }
      const newLayerId = Math.max(...this.keymap.layers.map((l: { id: number }) => l.id)) + 1;
      const newLayer = {
        id: newLayerId,
        name: `Layer ${newLayerId}`,
        bindings: Array(42).fill({ behaviorId: 2, param1: 0, param2: 0 }),
      };
      this.keymap.layers.push(newLayer);
      this.hasUnsavedChanges = true;
      return {
        addLayer: {
          ok: {
            index: this.keymap.layers.length - 1,
            layer: newLayer,
          },
        },
      };
    }

    if (request.removeLayer !== undefined) {
      const { layerIndex } = request.removeLayer;
      if (layerIndex < 0 || layerIndex >= this.keymap.layers.length) {
        return { removeLayer: { err: {} } };
      }
      if (this.keymap.layers.length <= 1) {
        return { removeLayer: { err: {} } };
      }
      this.keymap.layers.splice(layerIndex, 1);
      this.hasUnsavedChanges = true;
      return { removeLayer: { ok: {} } };
    }

    if (request.restoreLayer) {
      // For demo, we don't actually track removed layers
      // Just return an error
      return { restoreLayer: { err: {} } };
    }

    if (request.setActivePhysicalLayout !== undefined) {
      // For demo, we only have one layout, so always succeed
      return { setActivePhysicalLayout: { ok: this.keymap } };
    }

    return null;
  }

  // Handle behavior requests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleBehaviorRequest(request: any): any {
    if (request.listAllBehaviors) {
      return {
        listAllBehaviors: {
          behaviors: DEMO_DATA.behaviors.map((b) => b.id),
        },
      };
    }

    if (request.getBehaviorDetails) {
      const { behaviorId } = request.getBehaviorDetails;
      const behavior = DEMO_DATA.behaviors.find((b) => b.id === behaviorId);
      if (!behavior) {
        return null;
      }
      return { getBehaviorDetails: behavior };
    }

    return null;
  }

  // Handle core requests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleCoreRequest(request: any): any {
    if (request.getDeviceInfo) {
      return { getDeviceInfo: DEMO_DATA.deviceInfo };
    }

    return null;
  }
}

/**
 * Process an RPC request and generate a response
 */
function processRequest(state: DemoState, request: Request): Response {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestId: (request as any).requestId,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((request as any).keymap) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keymapResponse = state.handleKeymapRequest((request as any).keymap);
    if (keymapResponse) {
      response.keymap = keymapResponse;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((request as any).behaviors) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const behaviorResponse = state.handleBehaviorRequest((request as any).behaviors);
    if (behaviorResponse) {
      response.behaviors = behaviorResponse;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((request as any).core) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coreResponse = state.handleCoreRequest((request as any).core);
    if (coreResponse) {
      response.core = coreResponse;
    }
  }

  return response as Response;
}

/**
 * Connect to demo transport
 * Returns an RpcTransport that simulates a keyboard connection
 */
export async function connect(): Promise<RpcTransport> {
  const abortController = new AbortController();
  const state = new DemoState();

  // Create a TransformStream to handle requests
  const requestStream = new TransformStream<Uint8Array, Uint8Array>();
  const responseStream = new TransformStream<Uint8Array, Uint8Array>();

  // Process requests in the background
  (async () => {
    const reader = requestStream.readable.getReader();
    const writer = responseStream.writable.getWriter();

    try {
      while (!abortController.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        try {
          // Decode the request
          const request = RequestProto.decode(value) as Request;
          
          // Process and generate response
          const response = processRequest(state, request);
          
          // Encode and send response
          const encoded = ResponseProto.encode(response).finish();
          await writer.write(encoded);
        } catch (err) {
          console.error("Demo transport error processing request:", err);
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error("Demo transport stream error:", err);
      }
    } finally {
      reader.releaseLock();
      writer.releaseLock();
    }
  })();

  return {
    label: "Demo Transport",
    abortController,
    readable: responseStream.readable,
    writable: requestStream.writable,
  };
}
