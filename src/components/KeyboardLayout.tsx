/**
 * KeyboardLayout Component
 *
 * Renders the physical keyboard layout based on KeyPhysicalAttrs.
 * Handles key selection, modification display, and interaction.
 */
import { useMemo, useCallback } from "react";
import { PhysicalKey } from "./PhysicalKey";
import type {
  PhysicalLayout,
  KeyPhysicalAttrs,
  Layer,
  BehaviorBinding,
  BehaviorDefinition,
} from "../hooks/useKeymap";
import {
  getKeycodeByCode,
  getHidUsageCode,
  getHidUsagePage,
  HID_USAGE_PAGE_CONSUMER,
} from "../lib/keycodes";

// Scale factor for converting ZMK units to pixels
// Use a larger scale for better visibility
const SCALE = 1.0;
const UNIT_SIZE = 54; // pixels per unit (for 1U key)

interface KeyboardLayoutProps {
  /** Physical layout configuration */
  layout: PhysicalLayout;
  /** Current layer to display */
  layer: Layer;
  /** Map of behavior definitions */
  behaviors: Map<number, BehaviorDefinition>;
  /** Map of original bindings (unused but kept for potential future use) */
  // originalBindings: Map<string, BehaviorBinding>;
  /** Currently selected key position (or null) */
  selectedKey: number | null;
  /** Callback when a key is clicked */
  onKeyClick: (keyPosition: number) => void;
  /** Callback to reset a key to original */
  onKeyReset: (keyPosition: number) => void;
  /** Function to check if a binding is modified */
  isBindingModified: (layerId: number, keyPosition: number) => boolean;
  /** Function to get original binding */
  getOriginalBinding: (
    layerId: number,
    keyPosition: number
  ) => BehaviorBinding | null;
}

/**
 * Get display name for a binding based on behavior and parameters
 */
function getBindingDisplayName(
  binding: BehaviorBinding,
  behaviors: Map<number, BehaviorDefinition>,
  layers?: Layer[]
): string {
  const behavior = behaviors.get(binding.behaviorId);
  if (!behavior) {
    return `B${binding.behaviorId}`;
  }

  const behaviorName = behavior.displayName.toLowerCase();

  // Handle transparent
  if (behaviorName === "trans" || behaviorName === "transparent") {
    return "▽";
  }

  // Handle none
  if (behaviorName === "none") {
    return "✕";
  }

  // Handle key press - show the key
  if (behaviorName === "kp" || behaviorName === "key_press") {
    const usage = binding.param1;
    const page = getHidUsagePage(usage);
    const code = page === 0 ? usage : getHidUsageCode(usage);

    // Try keyboard page first
    const keycode = getKeycodeByCode(code);
    if (keycode) {
      return keycode.displayName;
    }

    // Try consumer page
    if (page === HID_USAGE_PAGE_CONSUMER || page === 0) {
      const consumerKeycode = getKeycodeByCode(usage);
      if (consumerKeycode) {
        return consumerKeycode.displayName;
      }
    }

    return `0x${code.toString(16).toUpperCase()}`;
  }

  // Handle layer behaviors
  if (
    behaviorName === "mo" ||
    behaviorName === "momentary" ||
    behaviorName.includes("layer")
  ) {
    const layerNum = binding.param1;
    if (layers && layers[layerNum]) {
      return `MO ${layers[layerNum].name || layerNum}`;
    }
    return `MO ${layerNum}`;
  }

  if (behaviorName === "to") {
    const layerNum = binding.param1;
    if (layers && layers[layerNum]) {
      return `TO ${layers[layerNum].name || layerNum}`;
    }
    return `TO ${layerNum}`;
  }

  if (behaviorName === "tog" || behaviorName === "toggle") {
    const layerNum = binding.param1;
    if (layers && layers[layerNum]) {
      return `TG ${layers[layerNum].name || layerNum}`;
    }
    return `TG ${layerNum}`;
  }

  if (behaviorName === "lt" || behaviorName === "layer_tap") {
    const layerNum = binding.param1;
    const keycode = getKeycodeByCode(binding.param2);
    const keyName = keycode?.displayName || `0x${binding.param2.toString(16)}`;
    return `LT${layerNum} ${keyName}`;
  }

  // Handle mod-tap
  if (behaviorName === "mt" || behaviorName === "mod_tap") {
    const keycode = getKeycodeByCode(binding.param2);
    const keyName = keycode?.displayName || "";
    return keyName ? `MT ${keyName}` : "MT";
  }

  // Handle sticky key
  if (behaviorName === "sk" || behaviorName === "sticky_key") {
    const keycode = getKeycodeByCode(binding.param1);
    const keyName = keycode?.displayName || "";
    return keyName ? `SK ${keyName}` : "SK";
  }

  // Handle macro
  if (behaviorName.includes("macro")) {
    return "Macro";
  }

  // Handle bootloader
  if (behaviorName === "bootloader" || behaviorName === "reset") {
    return "Boot";
  }

  // Handle sys reset
  if (behaviorName === "sys_reset") {
    return "Reset";
  }

  // Handle bluetooth behaviors with parameters
  if (behaviorName.includes("bt") || behaviorName === "bt") {
    // Common BT parameter values
    const btParams: Record<number, string> = {
      0: "CLR",
      1: "NXT",
      2: "PRV",
      3: "SEL 0",
      4: "SEL 1",
      5: "SEL 2",
      6: "SEL 3",
      7: "SEL 4",
    };
    const paramName = btParams[binding.param1] || `${binding.param1}`;
    return `BT ${paramName}`;
  }

  // Handle output selection
  if (behaviorName.includes("out") || behaviorName === "out") {
    const outParams: Record<number, string> = {
      0: "TOG",
      1: "USB",
      2: "BLE",
    };
    const paramName = outParams[binding.param1] || `${binding.param1}`;
    return `OUT ${paramName}`;
  }

  // Default: show behavior name with params if present
  if (binding.param1 !== 0 || binding.param2 !== 0) {
    return `${behavior.displayName} ${binding.param1}`;
  }
  
  return behavior.displayName;
}

export function KeyboardLayout({
  layout,
  layer,
  behaviors,
  selectedKey,
  onKeyClick,
  onKeyReset,
  isBindingModified,
  getOriginalBinding,
}: KeyboardLayoutProps) {
  // Calculate layout bounds for centering
  const bounds = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    layout.keys.forEach((key) => {
      const x = (key.x / 100) * SCALE * UNIT_SIZE;
      const y = (key.y / 100) * SCALE * UNIT_SIZE;
      const w = (key.width / 100) * SCALE * UNIT_SIZE;
      const h = (key.height / 100) * SCALE * UNIT_SIZE;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    return {
      width: maxX - minX + 20,
      height: maxY - minY + 20,
      offsetX: -minX + 10,
      offsetY: -minY + 10,
    };
  }, [layout.keys]);

  // Get display name for a key at position
  const getKeyDisplayName = useCallback(
    (_keyPosition: number, binding: BehaviorBinding | undefined): string => {
      if (!binding) return "—";
      return getBindingDisplayName(binding, behaviors);
    },
    [behaviors]
  );

  // Get original display name for tooltip
  const getOriginalDisplayName = useCallback(
    (keyPosition: number): string | undefined => {
      const original = getOriginalBinding(layer.id, keyPosition);
      if (!original) return undefined;
      return getBindingDisplayName(original, behaviors);
    },
    [getOriginalBinding, layer.id, behaviors]
  );

  return (
    <div className="relative overflow-auto">
      <div
        className="relative mx-auto"
        style={{
          width: `${bounds.width}px`,
          height: `${bounds.height}px`,
        }}
      >
        {layout.keys.map((key, position) => {
          const binding = layer.bindings[position];
          const modified = isBindingModified(layer.id, position);

          // Adjust position with offset for centering
          const adjustedKey: KeyPhysicalAttrs = {
            ...key,
            x: key.x + (bounds.offsetX / SCALE / UNIT_SIZE) * 100,
            y: key.y + (bounds.offsetY / SCALE / UNIT_SIZE) * 100,
          };

          return (
            <PhysicalKey
              key={position}
              attrs={adjustedKey}
              keyPosition={position}
              binding={binding}
              isModified={modified}
              displayName={getKeyDisplayName(position, binding)}
              originalDisplayName={
                modified ? getOriginalDisplayName(position) : undefined
              }
              isSelected={selectedKey === position}
              onClick={() => onKeyClick(position)}
              onReset={() => onKeyReset(position)}
            />
          );
        })}
      </div>
    </div>
  );
}
