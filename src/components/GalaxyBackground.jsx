import React from 'react';

export default function GalaxyBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <div className="stars"></div>
      <div className="planet planet-1"></div>
      <div className="planet planet-2"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-dark/50 to-space-dark pointer-events-none"></div>
    </div>
  );
}
