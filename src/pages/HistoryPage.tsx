import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WorkoutRecord } from "../types";
import { getWorkouts, deleteWorkout } from "../utils/storage";
import { useSwipeBack } from "../utils/useSwipeBack";
import { getExercises } from "../data/exercises";
import Card from "../components/ui/Card";

const dayLabels: Record<string, string> = {
  push: "推日 🏋️",
  pull: "拉日 💪",
  legs: "蹲日 🦵",
};

type FilterType = "all" | "push" | "pull" | "legs";

const filters: { value: FilterType; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "push", label: "推日" },
  { value: "pull", label: "拉日" },
  { value: "legs", label: "蹲日" },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const swipe = useSwipeBack();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>(() => getWorkouts());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  function refresh() {
    setWorkouts(getWorkouts());
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleDelete(id: string) {
    deleteWorkout(id);
    setWorkouts(getWorkouts());
    if (expandedId === id) setExpandedId(null);
  }

  function handleEdit(record: WorkoutRecord) {
    navigate(`/workout/${record.dayType}`, { state: { record } });
  }

  const filtered = filter === "all"
    ? workouts
    : workouts.filter((w) => w.dayType === filter);

  const exerciseMap = new Map(
    getExercises("push")
      .concat(getExercises("pull"), getExercises("legs"))
      .map((ex) => [ex.id, ex.name])
  );

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 animate-fade-in" {...swipe}>
      {/* 顶部导航 */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate("/")}
          className="text-brand-500 text-[15px] font-medium
                     hover:text-brand-600 transition-colors"
        >
          &larr; 返回
        </button>
        <h1 className="text-[22px] font-semibold text-gray-900 mx-auto">
          历史记录
        </h1>
        <button
          onClick={refresh}
          className="text-brand-500 text-sm font-medium hover:text-brand-600 transition-colors"
        >
          刷新
        </button>
      </div>

      {/* 类型筛选 */}
      <div className="flex gap-2 mb-5 w-full max-w-sm mx-auto">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-apple-xs text-sm font-medium transition-all duration-200
              ${filter === f.value
                ? "bg-brand-500 text-white shadow-apple"
                : "bg-white text-gray-500 hover:bg-brand-50"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 空状态 */}
      {filtered.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <span className="text-[40px]">{workouts.length === 0 ? "📋" : "🔍"}</span>
          <p className="text-gray-400 text-[15px] mt-3">
            {workouts.length === 0 ? "暂无训练记录" : "没有该类型的记录"}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            {workouts.length === 0
              ? "完成一次训练后，记录会显示在这里"
              : "试试其他筛选条件"
            }
          </p>
        </Card>
      )}

      {/* 记录列表 */}
      <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
        {filtered.map((workout) => (
          <Card key={workout.id} className="p-4 animate-fade-in">
            <button
              onClick={() => toggleExpand(workout.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <span className="text-[15px] font-medium text-gray-900">
                  {dayLabels[workout.dayType] ?? workout.dayType}
                </span>
                <span className="text-gray-400 text-sm ml-3">
                  {workout.date}
                </span>
              </div>
              <span
                className="text-gray-400 text-lg transition-transform duration-200"
                style={{
                  transform: expandedId === workout.id ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                &rsaquo;
              </span>
            </button>

            {expandedId === workout.id && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {workout.exercises.map((er) => (
                  <div key={er.exerciseId} className="bg-brand-50 rounded-apple-xs p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {exerciseMap.get(er.exerciseId) ?? (er.exerciseId.startsWith("cardio-") ? "有氧运动" : "未知动作")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {er.sets.map((set, i) => (
                        <span
                          key={i}
                          className="bg-white rounded-apple-xs px-2.5 py-1 text-xs text-gray-600"
                        >
                          {set.duration != null && set.duration > 0
                            ? `${set.duration} 分钟`
                            : `${set.weight ?? 0}kg × ${set.reps ?? 0}`
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 mt-1">
                  <button
                    onClick={() => handleEdit(workout)}
                    className="text-brand-500 text-xs font-medium hover:text-brand-600 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="text-red-400 text-xs font-medium hover:text-red-500 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
