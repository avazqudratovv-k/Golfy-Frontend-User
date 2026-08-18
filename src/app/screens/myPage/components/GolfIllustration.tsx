import React from "react";

export default function GolfIllustration(): React.JSX.Element {
  return (
    <div className="golf-illustration">
      {/* Explicitly mapping viewBox while ensuring styling scalability */}
      <svg viewBox="0 0 220 280" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="110" cy="250" rx="95" ry="18" fill="#E8F5E9" />
        <line
          x1="100"
          y1="60"
          x2="100"
          y2="248"
          stroke="#2E7D32"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <g className="flag-sway">
          <path d="M100 60 L160 78 L100 96 Z" fill="#2E7D32" />
        </g>
        <circle cx="100" cy="248" r="7" fill="#1B5E20" />
        <g className="ball-bob">
          <circle
            cx="55"
            cy="230"
            r="12"
            fill="#fff"
            stroke="#ddd"
            strokeWidth="1"
          />
          <circle cx="51" cy="226" r="1.4" fill="#ddd" />
          <circle cx="59" cy="226" r="1.4" fill="#ddd" />
          <circle cx="55" cy="232" r="1.4" fill="#ddd" />
        </g>
        <path
          d="M10 260 Q110 240 210 260"
          stroke="#2E7D32"
          strokeWidth="3"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
