/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { useCallback, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

// FLIP (First, Last, Invert, Play) animation for a list whose order
// changes between renders. The caller registers each row's DOM node
// via the returned `register(id)` ref callback and passes the current
// ordered list of ids on every render.
//
// When `ids` changes between renders:
//   1. We've captured the previous rect of every registered node in
//      a ref (the "First" snapshot, taken at the end of the previous
//      effect run).
//   2. After React commits the new order, each node has moved to its
//      "Last" position.
//   3. For each moved node we compute deltaY = oldTop - newTop and
//      apply transform: translateY(deltaY) with transition: none —
//      "Invert" — visually parking the row at its old spot.
//   4. On the next frame we clear the transform with a short
//      transition — "Play" — and the browser animates the row to
//      its natural new position.
//
// Skipped entirely when the user has prefers-reduced-motion: reduce
// — the global CSS rule in index.css already neutralizes
// transition-duration, but we also bail in JS to avoid the layout
// thrash of measuring rects we won't animate.
//
// Skipped per-row when @dnd-kit is actively dragging the row (the
// caller passes `isRowDragging(id)` so we don't fight useSortable's
// own transform).

const FLIP_TRANSITION = "transform 200ms ease-out";

export interface UseFlipAnimationResult {
  /** Ref callback to attach to each sortable row. Pass the id; the
   *  returned function is the `ref={...}` for that row. */
  register: (id: string) => (node: HTMLElement | null) => void;
}

export function useFlipAnimation(
  ids: readonly string[],
  options?: { isRowDragging?: (id: string) => boolean },
): UseFlipAnimationResult {
  const reducedMotion = useReducedMotion();
  const nodesRef = useRef<Map<string, HTMLElement>>(new Map());
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const prevIdsRef = useRef<readonly string[]>([]);
  const isRowDragging = options?.isRowDragging;

  const register = useCallback((id: string) => {
    return (node: HTMLElement | null) => {
      if (node) {
        nodesRef.current.set(id, node);
      } else {
        nodesRef.current.delete(id);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion) {
      // Refresh the rect cache so when the user toggles their OS
      // motion preference back off we don't try to animate from a
      // stale baseline. Skip everything else.
      prevRectsRef.current.clear();
      for (const [id, node] of nodesRef.current) {
        prevRectsRef.current.set(id, node.getBoundingClientRect());
      }
      prevIdsRef.current = ids;
      return;
    }

    // Compute the FLIP transform for every row whose old vs new
    // position differs. We compare the new bounding rect (taken now,
    // after commit) against the captured `prevRectsRef`.
    for (const id of ids) {
      const node = nodesRef.current.get(id);
      if (!node) continue;
      if (isRowDragging?.(id)) continue;
      const oldRect = prevRectsRef.current.get(id);
      const newRect = node.getBoundingClientRect();
      if (!oldRect) continue;
      const deltaY = oldRect.top - newRect.top;
      if (deltaY === 0) continue;

      // Invert: park the node visually at its old position with no
      // transition, then force a synchronous layout flush so the
      // browser commits this state before we ask for the next frame.
      node.style.transition = "none";
      node.style.transform = `translateY(${deltaY}px)`;
      // Reading offsetHeight flushes pending style changes.
      void node.offsetHeight;

      // Play: in the next frame, switch on the transition and clear
      // the transform. The browser animates back to natural position.
      requestAnimationFrame(() => {
        node.style.transition = FLIP_TRANSITION;
        node.style.transform = "";
        const onEnd = () => {
          node.style.transition = "";
          node.removeEventListener("transitionend", onEnd);
        };
        node.addEventListener("transitionend", onEnd);
      });
    }

    // Refresh the cache with the post-commit rects, for the next
    // reorder. Done AFTER the transform application above because
    // those reads (newRect via getBoundingClientRect) are the same
    // values we want to cache going forward.
    prevRectsRef.current.clear();
    for (const [id, node] of nodesRef.current) {
      prevRectsRef.current.set(id, node.getBoundingClientRect());
    }
    prevIdsRef.current = ids;
  }, [ids, reducedMotion, isRowDragging]);

  return { register };
}
