import { useState } from "react";
import CardComponent from "./CardComponent";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const intervals = ["Diario", "Semanal", "Mensual", "Anual"];

const dataSets = {
  temperature: [
    { month: "Ene", value: 22 },
    { month: "Feb", value: 23 },
    { month: "Mar", value: 24 },
    { month: "Abr", value: 22 },
    { month: "May", value: 21 },
    { month: "Jun", value: 23 },
    { month: "Jul", value: 25 },
    { month: "Ago", value: 26 },
    { month: "Sep", value: 24 },
    { month: "Oct", value: 22 },
    { month: "Nov", value: 23 },
    { month: "Dic", value: 22 },
  ],
  humidity: [
    { month: "Ene", value: 60 },
    { month: "Feb", value: 58 },
    { month: "Mar", value: 65 },
    { month: "Abr", value: 70 },
    { month: "May", value: 72 },
    { month: "Jun", value: 68 },
    { month: "Jul", value: 66 },
    { month: "Ago", value: 64 },
    { month: "Sep", value: 67 },
    { month: "Oct", value: 69 },
    { month: "Nov", value: 70 },
    { month: "Dic", value: 68 },
  ],
  co2: [
    { month: "Ene", value: 400 },
    { month: "Feb", value: 420 },
    { month: "Mar", value: 430 },
    { month: "Abr", value: 450 },
    { month: "May", value: 440 },
    { month: "Jun", value: 460 },
    { month: "Jul", value: 480 },
    { month: "Ago", value: 500 },
    { month: "Sep", value: 470 },
    { month: "Oct", value: 450 },
    { month: "Nov", value: 430 },
    { month: "Dic", value: 410 },
  ],
  luminosity: [
    { month: "Ene", value: 800 },
    { month: "Feb", value: 850 },
    { month: "Mar", value: 900 },
    { month: "Abr", value: 750 },
    { month: "May", value: 720 },
    { month: "Jun", value: 810 },
    { month: "Jul", value: 830 },
    { month: "Ago", value: 870 },
    { month: "Sep", value: 900 },
    { month: "Oct", value: 880 },
    { month: "Nov", value: 860 },
    { month: "Dic", value: 840 },
  ],
};

const Aire = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8 xl:px-12 w-full mx-auto py-12">
      {Object.entries(dataSets).map(([key, data]) => (
        <CardComponent
          key={key}
          title={
            key === "temperature" ? "🌡️ Temperatura" :
            key === "humidity" ? "💧 Humedad" :
            key === "co2" ? "🛑 CO₂" : "🔆 Luminosidad"
          }
          unit={
            key === "temperature" ? "°C" :
            key === "humidity" ? "%" :
            key === "co2" ? "ppm" : "lux"
          }
          chartData={data}
          color={
            key === "temperature" ? "#FF5733" :
            key === "humidity" ? "#3498DB" :
            key === "co2" ? "#2ECC71" : "#F1C40F"
          }
        />
      ))}
    </div>
  );
};

export default Aire;