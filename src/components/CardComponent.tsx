// src/components/CardComponent.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Timeframe = "Diario" | "Semanal" | "Mensual" | "Anual";

interface DataPoint {
  time: string;
  value: number;
}

interface CardComponentProps {
  title: string;
  unit: string;
  color: string;
  chartData: DataPoint[]; // espera 24 valores para “Diario”
}

export default function CardComponent({
  title,
  unit,
  color,
  chartData,
}: CardComponentProps) {
  const [tf, setTf] = useState<Timeframe>("Mensual");

  // Filtrar y formatear según timeframe
  const { data, legendLabel } = useMemo(() => {
    let d: DataPoint[] = [];
    let label = "";
    switch (tf) {
      case "Diario":
        d = chartData.slice(0, 24).map((p, i) => ({
          time: `${i}:00`,
          value: p.value,
        }));
        label = "Hora";
        break;
      case "Semanal":
        d = chartData.slice(0, 7).map((p, i) => ({
          time: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
          value: p.value,
        }));
        label = "Día";
        break;
      case "Mensual":
        d = chartData.slice(0, 12).map((p, i) => ({
          time:
            ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i] ||
            p.time,
          value: p.value,
        }));
        label = "Mes";
        break;
      case "Anual":
        const avg =
          chartData.reduce((sum, x) => sum + x.value, 0) / chartData.length;
        d = [{ time: "Año", value: +avg.toFixed(1) }];
        label = "Año";
        break;
    }
    return { data: d, legendLabel: label };
  }, [tf, chartData]);

  // Cálculo de media
  const average = useMemo(() => {
    const sum = data.reduce((s, p) => s + p.value, 0);
    return (sum / data.length).toFixed(1);
  }, [data]);

  const gradientId = `grad-${title.replace(/\s+/g, "-")}`;

  return (
    <Card className="relative w-full flex flex-col shadow-lg border-2 border-green-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded-md"
              variant="outline"
            >
              {tf}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white z-50">
            {( ["Diario", "Semanal", "Mensual", "Anual"] as Timeframe[] ).map(
              (opt) => (
                <DropdownMenuItem key={opt} onClick={() => setTf(opt)}>
                  {opt}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex-grow">
        <div
          className="w-full overflow-x-auto"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
        >
          <div className="min-w-[300px] md:min-w-full" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                onClick={() => {}}
                onTouchStart={() => {}}
                onTouchMove={() => {}}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip
                  trigger="click"
                  labelFormatter={(lbl) => `${legendLabel}: ${lbl}`}
                  wrapperStyle={{ zIndex: 999 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={`url(#${gradientId})`}
                  cursor="pointer"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm font-medium">
          Media: {average} {unit}
        </div>
        <div className="text-sm text-gray-600">{legendLabel}</div>
      </CardFooter>
    </Card>
  );
}
