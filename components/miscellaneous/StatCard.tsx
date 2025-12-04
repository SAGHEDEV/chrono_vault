import { ReactNode } from "react";
import { BarChart3, Lock, Unlock, Clock } from "lucide-react"; // example icons

interface StatCardProps {
  label: string;
  value: number | string;
  Icon?: ReactNode;
  accent?: string; // Hex color for accent
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  Icon,
  accent = "#1A73E8",
}) => {
  return (
    <div className="w-full brutalist-card p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1 w-fit">
          <p className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wide">{label}</p>
          <p className="text-4xl font-black text-[#0A0A0A]">{value}</p>
        </div>
        <div
          style={{ backgroundColor: accent }}
          className="p-3 w-fit h-fit brutalist-border flex items-center justify-center text-white rounded-2xl"
        >
          {Icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
