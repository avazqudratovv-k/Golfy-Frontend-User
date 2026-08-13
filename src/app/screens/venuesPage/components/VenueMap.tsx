import React from "react";

const staticPlaces = [
  "Riverside Greens",
  "Hilltop 18",
  "Sunset Links",
  "Downtown Range",
];

export default function VenueMap() {
  return (
    <div className="venue-map-frame">
      <div className="venue-map-title">Venues near you</div>
      <div className="venue-map">
        <svg width="100%" height="100%" viewBox="0 0 600 180">
          <path
            d="M0 60 Q150 20 300 55 T600 40"
            fill="none"
            stroke="#2E7D32"
            strokeWidth="8"
            opacity="0.3"
          />
          <path
            d="M0 140 Q200 170 400 130 T600 150"
            fill="none"
            stroke="#2E7D32"
            strokeWidth="6"
            opacity="0.25"
          />
          <circle cx="120" cy="70" r="7" fill="#2E7D32" />
          <text x="120" y="55" textAnchor="middle" fontSize="12" fill="#2E7D32">
            {staticPlaces[0]}
          </text>
          <circle cx="300" cy="45" r="7" fill="#2E7D32" />
          <text x="300" y="30" textAnchor="middle" fontSize="12" fill="#2E7D32">
            {staticPlaces[1]}
          </text>
          <circle cx="440" cy="100" r="7" fill="#2E7D32" />
          <text
            x="440"
            y="120"
            textAnchor="middle"
            fontSize="12"
            fill="#2E7D32"
          >
            {staticPlaces[2]}
          </text>
          <circle cx="520" cy="60" r="7" fill="#2E7D32" />
          <text x="520" y="45" textAnchor="middle" fontSize="12" fill="#2E7D32">
            {staticPlaces[3]}
          </text>
        </svg>
      </div>
    </div>
  );
}
