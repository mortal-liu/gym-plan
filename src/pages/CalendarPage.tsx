import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkouts, toggleRestDay, getRestDays } from "../utils/storage";
import Card from "../components/ui/Card";

const dayTypeColors: Record<string, string> = {
  push: "bg-rose-400",
  pull: "bg-amber-400",
  legs: "bg-sky-400",
  rest: "bg-gray-300",
};

const dayTypeLabels: Record<string, string> = {
  push: "推",
  pull: "拉",
  legs: "蹲",
  rest: "休",
};

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [, setTick] = useState(0);

  const workouts = getWorkouts();
  const restDays = getRestDays();

  // 同一日期可能有多种训练类型
  const dateMap: Record<string, string[]> = {};
  for (const w of workouts) {
    if (!dateMap[w.date]) dateMap[w.date] = [];
    if (!dateMap[w.date].includes(w.dayType)) {
      dateMap[w.date].push(w.dayType);
    }
  }
  for (const d of restDays) {
    if (!dateMap[d]) {
      dateMap[d] = ["rest"];
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDow = new Date(year, month, 0).getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const cells: { day: number; date: string; types: string[] }[] = [];

  for (let i = 0; i < startDow; i++) {
    cells.push({ day: 0, date: "", types: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, date: dateStr, types: dateMap[dateStr] ?? [] });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else { setMonth(month - 1); }
  }

  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else { setMonth(month + 1); }
  }

  function handleDayClick(date: string, types: string[]) {
    if (types.length > 0 && !types.includes("rest")) {
      navigate("/history");
    } else if (date <= todayStr) {
      toggleRestDay(date);
      setTick((t) => t + 1);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-brand-500 text-[15px] font-medium hover:text-brand-600 transition-colors"
        >
          &larr; 返回
        </button>
      </div>

      <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-5">
        <button onClick={prevMonth} className="text-gray-400 text-lg px-2 hover:text-gray-600 transition-colors">
          &lsaquo;
        </button>
        <h2 className="text-[20px] font-semibold text-gray-900">
          {year} 年 {month + 1} 月
        </h2>
        <button onClick={nextMonth} className="text-gray-400 text-lg px-2 hover:text-gray-600 transition-colors">
          &rsaquo;
        </button>
      </div>

      <div className="flex gap-4 justify-center mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> 推日</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 拉日</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> 蹲日</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> 休息</span>
      </div>

      <Card className="p-4 max-w-sm mx-auto">
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((cell, i) => (
            <button
              key={i}
              onClick={() => cell.day > 0 && handleDayClick(cell.date, cell.types)}
              className={`aspect-square flex flex-col items-center justify-center rounded-apple-xs
                text-sm font-medium transition-all duration-150
                ${cell.day === 0 ? "invisible" : ""}
                ${cell.date === todayStr ? "ring-2 ring-brand-300" : ""}
                ${cell.types.length > 0 ? "hover:opacity-80" : "hover:bg-brand-50"}
              `}
            >
              <span className={cell.types.length > 0 ? "text-gray-700" : "text-gray-400"}>
                {cell.day}
              </span>
              {cell.types.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {cell.types.map((t) => (
                    <span
                      key={t}
                      className={`text-[10px] text-white px-1.5 py-[1px] rounded-full ${dayTypeColors[t]}`}
                    >
                      {dayTypeLabels[t]}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      <p className="text-gray-400 text-xs text-center mt-4">
        点击训练日查看历史 · 点击空白日期标记休息日
      </p>
    </div>
  );
}
