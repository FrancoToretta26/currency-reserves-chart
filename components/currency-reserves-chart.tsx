"use client";

import { useState, useEffect } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ReserveData {
  fecha: string;
  reservas_dolares: number;
  reservas_en_pesos: number;
}

export default function CurrencyReservesChart() {
  const [showDollars, setShowDollars] = useState(true);
  const [data, setData] = useState<ReserveData[]>([]);

  useEffect(() => {
    fetch("/api/reservas")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort(
          (a: ReserveData, b: ReserveData) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        setData(sortedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const formatCurrency = (value: number | string, isDollars: boolean) => {
    if (typeof value !== "number") {
      return value;
    }
    return isDollars
      ? `$${value.toFixed(2)}`
      : `${value.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        })}`;
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Currency Reserves Over Time</CardTitle>
        <CardDescription>
          Showing reserves in {showDollars ? "US Dollars" : "Argentine Pesos"}
        </CardDescription>
        <div className="flex items-center space-x-2">
          <Switch
            id="currency-switch"
            checked={showDollars}
            onCheckedChange={setShowDollars}
          />
          <Label htmlFor="currency-switch">
            {showDollars ? "Show in Pesos" : "Show in Dollars"}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="fecha"
                angle={-45}
                textAnchor="end"
                height={80}
                label={{ value: "Date", position: "insideBottom", offset: -50 }}
              />
              <YAxis
                label={{
                  value: showDollars ? "Reserves (USD)" : "Reserves (ARS)",
                  angle: -90,
                  position: "insideLeft",
                  offset: -40,
                }}
              />
              <Tooltip
                formatter={(value: number | string) =>
                  formatCurrency(value, showDollars)
                }
              />
              <Line
                type="monotone"
                dataKey={showDollars ? "reservas_dolares" : "reservas_en_pesos"}
                stroke="hsl(var(--primary))"
                name={showDollars ? "Reserves (USD)" : "Reserves (ARS)"}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
