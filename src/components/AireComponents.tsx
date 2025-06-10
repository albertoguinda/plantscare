// src/components/AireComponents.tsx
"use client";

import React from "react";
import CardComponent from "./CardComponent";

interface DataPoint { time: string; value: number; }
const generateHourly = (base: number, variance: number): DataPoint[] =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: +(base + (Math.random() - 0.5) * variance).toFixed(1),
}));

export default function AireComponents() {
  const temperatureData = generateHourly(22, 4);
  const humidityData    = generateHourly(65, 10);
  const co2Data         = generateHourly(450, 100);
  const luminosityData  = generateHourly(800, 200);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-8 xl:px-12 w-full mx-auto py-12">
      <CardComponent title="🌡️ Temperatura" unit="°C" color="#EF4444" chartData={temperatureData} />
      <CardComponent title="💧 Humedad"    unit="%" color="#3B82F6" chartData={humidityData} />
      <CardComponent title="🛑 CO₂"        unit="ppm" color="#10B981" chartData={co2Data} />
      <CardComponent title="🔆 Luminosidad" unit="lux" color="#F59E0B" chartData={luminosityData} />
    </div>
  );
}
