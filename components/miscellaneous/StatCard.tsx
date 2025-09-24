import { ReactNode } from "react";
import { BarChart3, Lock, Unlock, Clock } from "lucide-react"; // example icons

interface StatCardProps {
  label: string;
  value: number | string;
  Icon?: ReactNode;
  accent?: string; // Tailwind color prefix, e.g. "blue", "green"
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  Icon,
  accent = "blue",
}) => {
  return (
    <div className="w-full border border-outline rounded-3xl p-4 flex flex-col gap-2">
      <div className="flex justify-between gap-10 ">
        <div className="flex flex-col gap-2 w-fit">
          <p className="text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-black">{value}</p>
        </div>
        <div
          style={{ color: `${accent}`, backgroundColor: `${accent}1A` }}
          className="p-2 w-fit h-fit rounded-full bg-gray-200/50 flex items-center justify-center"
        >
          {Icon}
        </div>
      </div>
      {/* <div className="max-w-48 xs-text">{description}</div> */}
    </div>
  );
};

export default StatCard;
