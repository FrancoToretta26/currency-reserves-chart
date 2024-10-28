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
  Area,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ReserveData {
  fecha: string;
  reservas_dolares: number;
  reservas_en_pesos: number;
}

type DateFilter = "all" | "30days" | "10days";

export default function CurrencyReservesChart() {
  const [showDollars, setShowDollars] = useState(true);
  const [data, setData] = useState<ReserveData[]>([]);
  const [filteredData, setFilteredData] = useState<ReserveData[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [totalReserves, setTotalReserves] = useState<number>(0);

  useEffect(() => {
    fetch("/api/reservas")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort(
          (a: ReserveData, b: ReserveData) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );
        setData(sortedData);
        setFilteredData(sortedData);
        const latestReserves = sortedData[sortedData.length - 1];
        setTotalReserves(
          showDollars
            ? latestReserves.reservas_dolares
            : latestReserves.reservas_en_pesos
        );
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [showDollars]);

  useEffect(() => {
    const currentDate = new Date();
    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.fecha);
      const diffTime = Math.abs(currentDate.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === "30days") return diffDays <= 30;
      if (dateFilter === "10days") return diffDays <= 10;
      return true;
    });
    setFilteredData(filteredData);
  }, [data, dateFilter]);

  useEffect(() => {
    if (data.length > 0) {
      const latestReserves = data[data.length - 1];
      setTotalReserves(
        showDollars
          ? latestReserves.reservas_dolares
          : latestReserves.reservas_en_pesos
      );
    }
  }, [showDollars, data]);

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
    <Card className="w-full max-w-4xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
          Total Reserves
        </h2>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          {showDollars
            ? `${formatCurrency(totalReserves, true)} USD`
            : `${formatCurrency(totalReserves, false)} ARS`}
        </p>
      </div>
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800 dark:text-gray-100">
          Currency Reserves Over Time
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Showing reserves in {showDollars ? "US Dollars" : "Argentine Pesos"}
        </CardDescription>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="currency-switch"
              checked={showDollars}
              onCheckedChange={setShowDollars}
            />
            <Label
              htmlFor="currency-switch"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {showDollars ? "Show in Pesos" : "Show in Dollars"}
            </Label>
          </div>
          <RadioGroup
            defaultValue="all"
            onValueChange={(value) => setDateFilter(value as DateFilter)}
            className="flex space-x-4"
          >
            {["all", "30days", "10days"].map((filter) => (
              <div key={filter} className="flex items-center space-x-2">
                <RadioGroupItem value={filter} id={filter} />
                <Label
                  htmlFor={filter}
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  {filter === "all"
                    ? "All"
                    : filter === "30days"
                    ? "30 Days"
                    : "10 Days"}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ccc"
                opacity={0.5}
              />
              <XAxis
                dataKey="fecha"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fill: "var(--gray-700)", fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: "var(--gray-700)", fontSize: 10 }}
                tickFormatter={(value) => formatCurrency(value, showDollars)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--gray-100)",
                  border: "1px solid var(--gray-300)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) =>
                  formatCurrency(value, showDollars)
                }
              />
              <defs>
                <linearGradient id="colorReserves" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={showDollars ? "reservas_dolares" : "reservas_en_pesos"}
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorReserves)"
              />
              <Line
                type="monotone"
                dataKey={showDollars ? "reservas_dolares" : "reservas_en_pesos"}
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
