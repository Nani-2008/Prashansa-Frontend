import { useEffect, useRef, useState } from "react";

const RevealOnScroll = ({
  children,
  className = "",
  delay = 0,
  y = 18,
  once = true,
  blur = 10,
  startScale = 0.97
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0px) scale(1)"
          : `translateY(${y}px) scale(${startScale})`,
        filter: isVisible ? "blur(0px)" : `blur(${blur}px)`
      }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
