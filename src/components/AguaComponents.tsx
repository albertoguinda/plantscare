// src/components/AguaComponents.tsx
"use client";

import React from "react";
import CardComponent from "./CardComponent";

interface DataPoint { time: string; value: number; }
const generateHourly = (base: number, variance: number): DataPoint[] =>
  Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: +(base + (Math.random() - 0.5) * variance).toFixed(1),
}));

export default function AguaComponents() {
  const temperatureData = generateHourly(22, 4);
  const phData          = generateHourly(6.5, 1);
  const ecData          = generateHourly(800, 200);
  const fosforoData     = generateHourly(10, 5);
  const potasioData     = generateHourly(20, 5);
  const calcioData      = generateHourly(30, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 md:px-8 xl:px-12 w-full mx-auto py-12">
      <CardComponent title="🌡️ Temperatura" unit="°C"    color="#EF4444" chartData={temperatureData} />
      <CardComponent title="🧪 pH"         unit=""       color="#3B82F6" chartData={phData} />
      <CardComponent title="⚡ EC"         unit="µS/cm" color="#10B981" chartData={ecData} />
      <CardComponent title="🟣 Fósforo"    unit="mg/L"   color="#8B5CF6" chartData={fosforoData} />
      <CardComponent title="🟠 Potasio"    unit="mg/L"   color="#F97316" chartData={potasioData} />
      <CardComponent title="⚪ Calcio"      unit="mg/L"   color="#A3A3A3" chartData={calcioData} />
    </div>
  );
}
