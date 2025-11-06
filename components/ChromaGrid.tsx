import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface ChromaGridItem {
  image: string;
  title: string;
  subtitle: string;
  handle: string;
  borderColor: string;
  gradient: string;
  url: string;
}

interface ChromaGridProps {
  items: ChromaGridItem[];
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  radius = 300,
  damping = 0.5,
  fadeOut = 0.5,
  ease = "power3.out",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      itemRefs.current.forEach((item) => {
        if (!item) return;

        const itemRect = item.getBoundingClientRect();
        const itemCenterX = itemRect.left - rect.left + itemRect.width / 2;
        const itemCenterY = itemRect.top - rect.top + itemRect.height / 2;

        const dx = mouseX - itemCenterX;
        const dy = mouseY - itemCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Repel effect
        if (distance < radius) {
          const angle = Math.atan2(dy, dx);
          const repelStrength = (radius - distance) / radius;
          const tx = -Math.cos(angle) * repelStrength * 50;
          const ty = -Math.sin(angle) * repelStrength * 50;

          gsap.to(item, {
            x: tx,
            y: ty,
            duration: damping,
            ease: ease,
          });

          // Opacity and glow effect
          const opacity = 1 - (repelStrength * fadeOut);
          gsap.to(item, {
            opacity: Math.max(0.2, opacity),
            boxShadow: `0 0 40px -10px ${item.style.getPropertyValue('--border-color')}`,
            duration: 0.3,
          });

        } else {
          // Return to original position
          gsap.to(item, {
            x: 0,
            y: 0,
            opacity: 1,
            boxShadow: '0 0 0px 0px rgba(0,0,0,0)',
            duration: damping,
            ease: ease,
          });
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      // Reset styles on unmount
      itemRefs.current.forEach(item => {
        if (item) gsap.to(item, { x: 0, y: 0, opacity: 1, boxShadow: 'none', duration: 0 });
      });
    };
  }, [radius, damping, fadeOut, ease]);

  return (
    <>
    <style>{`
      .chroma-grid-item {
        background-size: cover;
        background-position: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .chroma-grid-item .overlay {
        transition: opacity 0.4s ease;
      }
      .chroma-grid-item-link:hover .overlay {
        opacity: 1 !important;
      }
    `}</style>
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-full">
      {items.map((item, index) => (
        <a
          href={item.url}
          key={index}
          className="chroma-grid-item-link relative block w-full h-full rounded-2xl overflow-hidden no-underline"
        >
          <div
            ref={(el) => { itemRefs.current[index] = el; }}
            className="chroma-grid-item absolute inset-0 rounded-2xl"
            style={{ 
              backgroundImage: `url(${item.image})`,
              '--border-color': item.borderColor,
            } as React.CSSProperties}
          >
            <div
              className="overlay absolute inset-0 bg-black/70 opacity-0 p-6 flex flex-col justify-end"
            >
              <span className="text-xs font-semibold uppercase" style={{ color: item.borderColor }}>{item.subtitle}</span>
              <h3 className="text-white text-2xl font-bold mt-1">{item.title}</h3>
              <p className="text-gray-300 text-sm mt-2">{item.handle}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
    </>
  );
};

export default ChromaGrid;