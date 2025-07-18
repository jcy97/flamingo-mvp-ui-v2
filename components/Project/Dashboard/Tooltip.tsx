import { ReactNode, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

const Tooltip = ({ content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShowTooltip, setShouldShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (childRef.current) {
        const element = childRef.current.querySelector("h3");
        if (element) {
          setShouldShowTooltip(element.scrollWidth > element.clientWidth);
        }
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [content]);

  const handleMouseEnter = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 40,
        left: rect.left + rect.width / 2,
      });
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  if (!shouldShowTooltip) {
    return (
      <div ref={childRef} className="w-full">
        {children}
      </div>
    );
  }

  return (
    <>
      <div
        className="relative w-full"
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed px-3 py-2 bg-neutral-900 text-neutral-100 text-sm rounded-lg shadow-lg z-[9999] whitespace-nowrap border border-neutral-700 pointer-events-none transform -translate-x-1/2"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-neutral-900"></div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
