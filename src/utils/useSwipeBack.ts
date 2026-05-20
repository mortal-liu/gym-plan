import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const EDGE_WIDTH = 32;   // 左边缘触发区域
const MIN_DELTA = 70;    // 最小滑动距离

export function useSwipeBack() {
  const navigate = useNavigate();
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      if (x <= EDGE_WIDTH) {
        tracking.current = true;
        startX.current = x;
        startY.current = y;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!tracking.current) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = Math.abs(e.touches[0].clientY - startY.current);
      // 水平滑动为主，向右滑了足够距离
      if (dx > MIN_DELTA && dx > dy * 1.5) {
        tracking.current = false;
        navigate(-1);
      }
      // 手指离开左边缘太远就取消
      if (dx < -20 || dy > 40) {
        tracking.current = false;
      }
    }

    function onTouchEnd() {
      tracking.current = false;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [navigate]);
}
