"use client";

import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
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

interface CardComponentProps {
  title: string;
  unit: string;
  chartData: { month: string; value: number }[];
  color: string;
}

export default function CardComponent({
  title,
  unit,
  chartData,
  color,
}: CardComponentProps) {
  const [timeframe, setTimeframe] = useState("Mensual");

  const getFilteredData = () => {
    switch (timeframe) {
      case "Diario":
        return chartData.slice(0, 7);
      case "Semanal":
        return chartData.slice(0, 4);
      case "Mensual":
        return chartData;
      case "Anual":
        return [
          {
            month: "Promedio",
            value:
              chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length,
          },
        ];
      default:
        return chartData;
    }
  };

  const filteredData = getFilteredData();
  const average = (
    filteredData.reduce((sum, data) => sum + data.value, 0) /
    filteredData.length
  ).toFixed(1);

  const gradientId = `gradient-${title.replace(/\s+/g, "-")}`;
  return (
    <Card className="relative w-full h-full flex flex-col shadow-lg border-2 border-green-200">
      {" "}
      {/* Cambiado el borde aquí */}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded-md transition-colors"
              variant="outline"
            >
              {timeframe}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-green-100 text-black border border-green-300 shadow-lg rounded-md"
          >
            {["Diario", "Semanal", "Mensual", "Anual"].map((interval) => (
              <DropdownMenuItem
                key={interval}
                onClick={() => setTimeframe(interval)}
                className="hover:bg-green-100 focus:bg-green-100"
              >
                {interval}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickMargin={8} />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#${gradientId})`}
              stackId="a"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <div className="text-sm font-medium">
          Media: {average} {unit}
        </div>
      </CardFooter>
    </Card>
  );
}
