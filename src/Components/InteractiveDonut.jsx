import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveDonut = ({ data, colors, size = 220, label = 'Total', centerLabel = null }) => {
  const [hoveredKey, setHoveredKey] = useState(null);
  const [activeKey, setActiveKey] = useState(null);

  const total = useMemo(() => Object.values(data).reduce((a, b) => a + b, 0), [data]);

  const colorMap = {
    "bg-blue-500": "#3b82f6", "bg-indigo-500": "#6366f1",
    "bg-green-500": "#22c55e", "bg-purple-500": "#a855f7",
    "bg-pink-500": "#ec4899", "bg-yellow-500": "#eab308",
    "bg-red-500": "#ef4444", "bg-gray-400": "#9ca3af",
    "bg-emerald-500": "#10b981", "bg-orange-500": "#f97316",
  };

  const resolveColor = (key) => {
    const c = colors[key];
    if (!c) return '#9ca3af';
    if (c.hex) return c.hex;
    if (c.bg) return colorMap[c.bg] || '#9ca3af';
    return '#9ca3af';
  };

  const darken = (hex, amt = 40) => {
    let r = parseInt(hex.slice(1, 3), 16) - amt;
    let g = parseInt(hex.slice(3, 5), 16) - amt;
    let b = parseInt(hex.slice(5, 7), 16) - amt;
    return `#${Math.max(0,r).toString(16).padStart(2,'0')}${Math.max(0,g).toString(16).padStart(2,'0')}${Math.max(0,b).toString(16).padStart(2,'0')}`;
  };

  const lighten = (hex, amt = 60) => {
    let r = parseInt(hex.slice(1, 3), 16) + amt;
    let g = parseInt(hex.slice(3, 5), 16) + amt;
    let b = parseInt(hex.slice(5, 7), 16) + amt;
    return `#${Math.min(255,r).toString(16).padStart(2,'0')}${Math.min(255,g).toString(16).padStart(2,'0')}${Math.min(255,b).toString(16).padStart(2,'0')}`;
  };

  if (total === 0) return (
    <div className="flex items-center justify-center" style={{ width: size, height: size + 30 }}>
      <p className="text-sm text-[#86868b]">No data yet</p>
    </div>
  );

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 15;
  const innerR = outerR * 0.58;
  const tiltY = 0.75; // 3D perspective tilt

  // Build segments
  const segments = [];
  let startAngle = -Math.PI / 2;
  Object.entries(data).forEach(([key, value]) => {
    if (value === 0) return;
    const sweep = (value / total) * 2 * Math.PI;
    const endAngle = startAngle + sweep;
    const midAngle = startAngle + sweep / 2;
    const percent = Math.round((value / total) * 100);
    const isHovered = hoveredKey === key;
    const isActive = activeKey === key;
    const explode = isActive ? 8 : isHovered ? 4 : 0;

    segments.push({
      key, value, percent, startAngle, endAngle, midAngle, isHovered, isActive, explode,
      color: resolveColor(key)
    });
    startAngle = endAngle;
  });

  const polarToCart = (angle, r, ex = 0, ey = 0) => ({
    x: cx + ex + r * Math.cos(angle),
    y: cy + ey + r * Math.sin(angle) * tiltY
  });

  const makeArc = (startA, endA, r, ex = 0, ey = 0) => {
    const steps = Math.max(2, Math.ceil(Math.abs(endA - startA) / 0.05));
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const angle = startA + (endA - startA) * (i / steps);
      const p = polarToCart(angle, r, ex, ey);
      points.push(`${p.x},${p.y}`);
    }
    return points.join(' ');
  };

  const depthH = 18; // 3D depth in px

  return (
    <div className="relative" style={{ width: size, height: size + 30 }}>
      <svg width={size} height={size + 30} viewBox={`0 0 ${size} ${size + 30}`}>
        <defs>
          {segments.map(seg => (
            <React.Fragment key={`grad-${seg.key}`}>
              <linearGradient id={`grad-${seg.key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={lighten(seg.color, 40)} />
                <stop offset="100%" stopColor={seg.color} />
              </linearGradient>
              <linearGradient id={`side-${seg.key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={darken(seg.color, 30)} />
                <stop offset="100%" stopColor={darken(seg.color, 60)} />
              </linearGradient>
            </React.Fragment>
          ))}
          <filter id="donut-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
          </filter>
          <filter id="inner-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 3D Side walls (depth effect) — render bottom-most segments first */}
        {segments.slice().reverse().map(seg => {
          const ex = seg.explode * Math.cos(seg.midAngle);
          const ey = seg.explode * Math.sin(seg.midAngle) * tiltY;
          const outerArcTop = makeArc(seg.startAngle, seg.endAngle, outerR, ex, ey);
          const outerArcBottom = makeArc(seg.endAngle, seg.startAngle, outerR, ex, ey + depthH);

          // Only show side for lower half
          const midY = Math.sin(seg.midAngle) * tiltY;
          if (midY < -0.3) return null;

          return (
            <polygon
              key={`side-${seg.key}`}
              points={`${outerArcTop} ${outerArcBottom}`}
              fill={`url(#side-${seg.key})`}
              opacity={0.7}
            />
          );
        })}

        {/* Top face segments */}
        <g filter="url(#donut-shadow)">
          {segments.map(seg => {
            const ex = seg.explode * Math.cos(seg.midAngle);
            const ey = seg.explode * Math.sin(seg.midAngle) * tiltY;
            const outerArc = makeArc(seg.startAngle, seg.endAngle, outerR, ex, ey);
            const innerArc = makeArc(seg.endAngle, seg.startAngle, innerR, ex, ey);
            const scale = seg.isHovered ? 1.04 : 1;

            return (
              <motion.polygon
                key={`top-${seg.key}`}
                points={`${outerArc} ${innerArc}`}
                fill={`url(#grad-${seg.key})`}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
                style={{ cursor: 'pointer', transformOrigin: `${cx}px ${cy}px`, filter: seg.isHovered ? 'brightness(1.1)' : 'none' }}
                animate={{ scale }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onMouseEnter={() => setHoveredKey(seg.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => setActiveKey(activeKey === seg.key ? null : seg.key)}
              />
            );
          })}
        </g>

        {/* Glossy inner ring highlight */}
        {(() => {
          const steps = 60;
          const pts = [];
          for (let i = 0; i <= steps; i++) {
            const angle = -Math.PI / 2 + (2 * Math.PI * i / steps);
            const p = polarToCart(angle, innerR + 2);
            pts.push(`${p.x},${p.y}`);
          }
          return <polygon points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />;
        })()}

        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-[#1d1d1f] dark:fill-white text-3xl font-bold" style={{ fontSize: '28px', fontWeight: 700 }}>
          {centerLabel !== null ? centerLabel : total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-[#86868b] text-xs font-medium" style={{ fontSize: '12px' }}>
          {label}
        </text>
      </svg>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredKey && (() => {
          const seg = segments.find(s => s.key === hoveredKey);
          if (!seg) return null;
          const tp = polarToCart(seg.midAngle, outerR + 25, seg.explode * Math.cos(seg.midAngle), seg.explode * Math.sin(seg.midAngle) * tiltY);
          return (
            <motion.div
              key={hoveredKey}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute pointer-events-none bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] px-3 py-2 rounded-xl shadow-lg text-center z-20"
              style={{ left: tp.x, top: tp.y, transform: 'translate(-50%, -50%)' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-70 capitalize">{seg.key}</p>
              <p className="text-[15px] font-bold">{seg.value} <span className="text-[12px] opacity-60">({seg.percent}%)</span></p>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};



export default InteractiveDonut;
