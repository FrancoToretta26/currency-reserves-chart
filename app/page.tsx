import CurrencyReservesChart from "@/components/currency-reserves-chart";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <CurrencyReservesChart />
    </main>
  );
}
