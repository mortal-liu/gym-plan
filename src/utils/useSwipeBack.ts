import { useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const EDGE_WIDTH = 40;
const MIN_DELTA = 75;

export function useSwipeBack() {
  const navigate = useNavigate();
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    if (x <= EDGE_WIDTH) {
      tracking.current = true;
      startX.current = x;
      startY.current = y;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!tracking.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    if (dx > MIN_DELTA && dx > dy * 1.5) {
      tracking.current = false;
      navigate(-1);
    }
    if (dx < -20 || dy > 40) {
      tracking.current = false;
    }
  }, [navigate]);

  const onTouchEnd = useCallback(() => {
    tracking.current = false;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
