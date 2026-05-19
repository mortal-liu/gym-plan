import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";

type DayType = "push" | "pull" | "legs";

const days: { type: DayType; label: string; subtitle: string; emoji: string }[] = [
  { type: "push", label: "推日", subtitle: "胸 · 肩 · 二头", emoji: "🏋️" },
  { type: "pull", label: "拉日", subtitle: "背 · 三头", emoji: "💪" },
  { type: "legs", label: "蹲日", subtitle: "腿 · 臀", emoji: "🦵" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <h1 className="text-[28px] font-semibold text-gray-900 mb-2 tracking-tight animate-fade-in">
        今日训练
      </h1>
      <p className="text-gray-400 text-[15px] mb-8 animate-fade-in">
        选择你要训练的类型
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {days.map((day, i) => (
          <Card
            key={day.type}
            onClick={() => navigate(`/workout/${day.type}`)}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="text-[44px] leading-none">{day.emoji}</span>
            <h2 className="text-[20px] font-medium text-gray-900 mt-3">
              {day.label}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{day.subtitle}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-5 mt-8">
        <button
          onClick={() => navigate("/calendar")}
          className="text-brand-500 text-[15px] font-medium
                     hover:text-brand-600 transition-colors duration-200"
        >
          训练日历 &rarr;
        </button>
        <button
          onClick={() => navigate("/history")}
          className="text-brand-500 text-[15px] font-medium
                     hover:text-brand-600 transition-colors duration-200"
        >
          历史记录 &rarr;
        </button>
      </div>
    </div>
  );
}
