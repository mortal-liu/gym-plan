import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(0,0,0,0.15)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-apple shadow-apple-hover px-6 py-7 mx-8 max-w-xs w-full
                   flex flex-col items-center text-center"
        style={{
          animation: "modal-pop 0.25s ease-out both",
        }}
      >
        <style>{`
          @keyframes modal-pop {
            from { opacity: 0; transform: scale(0.92) translateY(8px); }
            to   { opacity: 1; transform: scale(1)   translateY(0); }
          }
        `}</style>
        {children}
        <button
          onClick={onClose}
          className="mt-5 px-8 py-2.5 bg-brand-500 text-white text-[15px] font-medium
                     rounded-apple-xs hover:bg-brand-600 active:scale-[0.97]
                     transition-all duration-200"
        >
          好的
        </button>
      </div>
    </div>
  );
}
