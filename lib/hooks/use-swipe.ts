import { useEffect, useRef, useState } from "react";

export interface SwipeInput {
  deltaX: number;
  deltaY: number;
  absX: number;
  absY: number;
  velocity: number;
  direction: "left" | "right" | "up" | "down" | null;
}

export interface SwipeHandlers {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  onSwipedUp?: () => void;
  onSwipedDown?: () => void;
  onSwiping?: (data: SwipeInput) => void;
  onSwiped?: (data: SwipeInput) => void;
}

interface SwipeOptions extends SwipeHandlers {
  delta?: number; // Minimum distance in pixels to trigger swipe
  preventScrollOnSwipe?: boolean;
  trackTouch?: boolean;
  trackMouse?: boolean;
  rotationAngle?: number;
}

interface TouchData {
  x: number;
  y: number;
  time: number;
}

const defaultOptions: Required<Omit<SwipeOptions, keyof SwipeHandlers>> = {
  delta: 10,
  preventScrollOnSwipe: false,
  trackTouch: true,
  trackMouse: false,
  rotationAngle: 0,
};

/**
 * Hook for detecting swipe gestures on touch devices
 *
 * @example
 * ```tsx
 * const handlers = useSwipe({
 *   onSwipedLeft: () => console.log("Swiped left!"),
 *   onSwipedRight: () => console.log("Swiped right!"),
 *   delta: 50, // Minimum 50px swipe
 * });
 *
 * return <div {...handlers}>Swipe me!</div>;
 * ```
 */
export function useSwipe(options: SwipeOptions = {}) {
  const { delta, preventScrollOnSwipe, trackTouch, trackMouse, rotationAngle } = {
    ...defaultOptions,
    ...options,
  };

  const touchStart = useRef<TouchData | null>(null);
  const touchEnd = useRef<TouchData | null>(null);
  const [swiping, setSwiping] = useState(false);

  const calculateVelocity = (start: TouchData, end: TouchData): number => {
    const timeDiff = end.time - start.time;
    if (timeDiff === 0) return 0;
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    return distance / timeDiff;
  };

  const getSwipeDirection = (
    deltaX: number,
    deltaY: number,
  ): "left" | "right" | "up" | "down" | null => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < delta) return null;

    if (absX > absY) {
      return deltaX > 0 ? "right" : "left";
    } else {
      return deltaY > 0 ? "down" : "up";
    }
  };

  const handleTouchStart = (event: React.TouchEvent | React.MouseEvent) => {
    const touch = "touches" in event ? event.touches[0] : event;
    if (!touch) return;

    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = null;
    setSwiping(false);
  };

  const handleTouchMove = (event: React.TouchEvent | React.MouseEvent) => {
    if (!touchStart.current) return;

    const touch = "touches" in event ? event.touches[0] : event;
    if (!touch) return;

    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > delta || absY > delta) {
      if (!swiping) {
        setSwiping(true);
      }

      const direction = getSwipeDirection(deltaX, deltaY);
      const velocity = calculateVelocity(touchStart.current, touchEnd.current);

      options.onSwiping?.({
        deltaX,
        deltaY,
        absX,
        absY,
        velocity,
        direction,
      });

      if (preventScrollOnSwipe && direction && (direction === "left" || direction === "right")) {
        event.preventDefault();
      }
    }
  };

  const handleTouchEnd = (event: React.TouchEvent | React.MouseEvent) => {
    if (!touchStart.current || !touchEnd.current) {
      touchStart.current = null;
      touchEnd.current = null;
      setSwiping(false);
      return;
    }

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const direction = getSwipeDirection(deltaX, deltaY);
    const velocity = calculateVelocity(touchStart.current, touchEnd.current);

    const swipeData: SwipeInput = {
      deltaX,
      deltaY,
      absX,
      absY,
      velocity,
      direction,
    };

    options.onSwiped?.(swipeData);

    if (direction) {
      switch (direction) {
        case "left":
          options.onSwipedLeft?.();
          break;
        case "right":
          options.onSwipedRight?.();
          break;
        case "up":
          options.onSwipedUp?.();
          break;
        case "down":
          options.onSwipedDown?.();
          break;
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
    setSwiping(false);
  };

  const handlers = {
    ...(trackTouch && {
      onTouchStart: handleTouchStart as React.TouchEventHandler,
      onTouchMove: handleTouchMove as React.TouchEventHandler,
      onTouchEnd: handleTouchEnd as React.TouchEventHandler,
    }),
    ...(trackMouse && {
      onMouseDown: handleTouchStart as React.MouseEventHandler,
      onMouseMove: handleTouchMove as React.MouseEventHandler,
      onMouseUp: handleTouchEnd as React.MouseEventHandler,
    }),
  };

  return {
    ...handlers,
    swiping,
  };
}
