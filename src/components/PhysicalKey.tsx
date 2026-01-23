/**
 * PhysicalKey Component
 *
 * Renders a single key in the physical keyboard layout.
 * Supports positioning, rotation, sizing, and interactive states.
 */
import { useState, useMemo } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { IconRotateClockwise } from "@tabler/icons-react";
import type { KeyPhysicalAttrs, BehaviorBinding } from "../hooks/useKeymap";

// Scale factor for converting ZMK units (1/100 mm) to pixels
// ZMK uses 1/100 of a "unit" (usually 19.05mm key spacing)
// We'll use a reasonable scale for display
const SCALE = 0.5; // Adjust as needed for display

interface PhysicalKeyProps {
  /** Physical attributes of the key (position, size, rotation) */
  attrs: KeyPhysicalAttrs;
  /** Key position index in the layout */
  keyPosition: number;
  /** Current binding for this key */
  binding?: BehaviorBinding;
  /** Whether this key has been modified from original */
  isModified: boolean;
  /** Display name for the binding */
  displayName: string;
  /** Original display name (for tooltip when modified) */
  originalDisplayName?: string;
  /** Whether this key is currently selected */
  isSelected: boolean;
  /** Callback when key is clicked */
  onClick: () => void;
  /** Callback to reset this key to original */
  onReset: () => void;
}

export function PhysicalKey({
  attrs,
  isModified,
  displayName,
  originalDisplayName,
  isSelected,
  onClick,
  onReset,
}: PhysicalKeyProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate dimensions and position
  // ZMK uses centimils (1/100 of a key unit) for dimensions
  // Standard key unit is usually around 19.05mm = 1900 centimils
  const style = useMemo(() => {
    const width = (attrs.width / 100) * SCALE * 48; // 48px per unit
    const height = (attrs.height / 100) * SCALE * 48;
    const x = (attrs.x / 100) * SCALE * 48;
    const y = (attrs.y / 100) * SCALE * 48;

    // Rotation: r is in centidegrees, rx and ry are rotation center
    const rotation = attrs.r / 100;
    const rotationCenterX = (attrs.rx / 100) * SCALE * 48;
    const rotationCenterY = (attrs.ry / 100) * SCALE * 48;

    return {
      width: `${Math.max(width, 20)}px`,
      height: `${Math.max(height, 20)}px`,
      left: `${x}px`,
      top: `${y}px`,
      transform:
        rotation !== 0
          ? `rotate(${rotation}deg)`
          : undefined,
      transformOrigin:
        rotation !== 0
          ? `${rotationCenterX - x}px ${rotationCenterY - y}px`
          : undefined,
    };
  }, [attrs]);

  // Key content
  const keyContent = (
    <div
      className={`
        absolute rounded-lg border cursor-pointer transition-all duration-150
        flex flex-col items-center justify-center p-1 overflow-hidden
        ${
          isSelected
            ? "bg-[var(--color-electric)]/20 border-[var(--color-electric)] shadow-[0_0_10px_rgba(0,212,255,0.3)]"
            : isModified
              ? "bg-[var(--color-neon)]/10 border-[var(--color-neon)]/50 hover:border-[var(--color-neon)]"
              : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-electric)]/50 hover:bg-[var(--color-electric)]/5"
        }
      `}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Display Name */}
      <span
        className={`
          text-[10px] font-medium text-center leading-tight break-all
          ${
            isModified
              ? "text-[var(--color-neon)]"
              : "text-[var(--color-text-muted)]"
          }
        `}
      >
        {displayName || "—"}
      </span>

      {/* Modified indicator */}
      {isModified && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[var(--color-neon)]" />
      )}

      {/* Reset button on hover when modified */}
      {isModified && isHovered && (
        <button
          className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-[var(--color-surface)]/80 hover:bg-[var(--color-surface)] border border-[var(--color-border)]"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          title="Reset to original"
        >
          <IconRotateClockwise
            size={10}
            className="text-[var(--color-text-muted)]"
          />
        </button>
      )}
    </div>
  );

  // Wrap with tooltip if modified
  if (isModified && originalDisplayName) {
    return (
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{keyContent}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="px-2 py-1 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] shadow-lg z-50"
              sideOffset={5}
            >
              <span className="text-[var(--color-text-muted)]">Original: </span>
              <span>{originalDisplayName}</span>
              <Tooltip.Arrow className="fill-[var(--color-surface-elevated)]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return keyContent;
}
