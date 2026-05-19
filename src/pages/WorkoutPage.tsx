import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { SetRecord, Exercise } from "../types";
import { getExercises, getDefaultExercises } from "../data/exercises";
import { saveWorkout, saveCustomExercises } from "../utils/storage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const dayInfo: Record<string, { label: string; emoji: string }> = {
  push: { label: "推日", emoji: "🏋️" },
  pull: { label: "拉日", emoji: "💪" },
  legs: { label: "蹲日", emoji: "🦵" },
};

export default function WorkoutPage() {
  const { dayType } = useParams<{ dayType: string }>();
  const navigate = useNavigate();
  const info = dayInfo[dayType ?? ""];

  const [exercises, setExercises] = useState<Exercise[]>(() => getExercises(dayType ?? ""));
  const [setsData, setSetsData] = useState<Record<string, SetRecord[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isManaging, setIsManaging] = useState(false);

  // 管理面板的临时状态
  const [editList, setEditList] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState("");

  // 切换训练类型时重置所有状态
  useEffect(() => {
    const list = getExercises(dayType ?? "");
    setExercises(list);
    resetSetsData(list);
    setExpanded(new Set());
    setIsManaging(false);
  }, [dayType]);

  function resetSetsData(list: Exercise[]) {
    const initial: Record<string, SetRecord[]> = {};
    for (const ex of list) {
      initial[ex.id] = [{ weight: 0, reps: 0 }];
    }
    setSetsData(initial);
  }

  if (!info) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <p className="text-gray-500">未知训练类型</p>
        <button onClick={() => navigate("/")} className="mt-4 text-brand-500 text-sm">
          &larr; 返回首页
        </button>
      </div>
    );
  }

  function updateSet(exerciseId: string, setIndex: number, field: "weight" | "reps", value: number) {
    setSetsData((prev) => {
      const sets = [...prev[exerciseId]];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      return { ...prev, [exerciseId]: sets };
    });
  }

  function addSet(exerciseId: string) {
    setSetsData((prev) => ({
      ...prev,
      [exerciseId]: [...prev[exerciseId], { weight: 0, reps: 0 }],
    }));
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setSetsData((prev) => {
      const sets = prev[exerciseId].filter((_, i) => i !== setIndex);
      return { ...prev, [exerciseId]: sets.length > 0 ? sets : [{ weight: 0, reps: 0 }] };
    });
  }

  function toggleExpand(exerciseId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  }

  function handleSave() {
    const exerciseRecords = exercises
      .map((ex) => ({
        exerciseId: ex.id,
        sets: setsData[ex.id]?.filter((s) => s.weight > 0 || s.reps > 0) ?? [],
      }))
      .filter((er) => er.sets.length > 0);

    if (exerciseRecords.length === 0) {
      alert("请至少记录一组训练数据");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    saveWorkout({
      id: Date.now().toString(),
      dayType: dayType as "push" | "pull" | "legs",
      date: today,
      exercises: exerciseRecords,
    });

    navigate("/history");
  }

  /* 动作管理相关 */

  function openManage() {
    setEditList([...exercises]);
    setNewName("");
    setIsManaging(true);
  }

  function addExercise() {
    const name = newName.trim();
    if (!name) return;
    if (editList.some((ex) => ex.name === name)) {
      alert("该动作已存在");
      return;
    }
    const newEx: Exercise = { id: Date.now().toString(), name };
    setEditList([...editList, newEx]);
    setNewName("");
  }

  function removeExercise(id: string) {
    if (editList.length <= 1) {
      alert("至少保留一个动作");
      return;
    }
    setEditList(editList.filter((ex) => ex.id !== id));
  }

  function resetToDefault() {
    setEditList(getDefaultExercises(dayType ?? ""));
  }

  function saveManage() {
    saveCustomExercises(dayType ?? "", editList);
    setExercises(editList);
    resetSetsData(editList);
    setIsManaging(false);
  }

  function cancelManage() {
    setIsManaging(false);
  }

  /* 管理面板 */
  if (isManaging) {
    return (
      <div className="min-h-screen flex flex-col px-5 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={cancelManage}
            className="text-brand-500 text-[15px] font-medium hover:text-brand-600 transition-colors"
          >
            &larr; 返回
          </button>
          <h1 className="text-[22px] font-semibold text-gray-900 mx-auto">管理动作</h1>
          <div className="w-10" />
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          {editList.map((ex) => (
            <Card key={ex.id} className="p-4 flex items-center justify-between">
              <span className="text-[16px] font-medium text-gray-900">{ex.name}</span>
              <button
                onClick={() => removeExercise(ex.id)}
                className="w-7 h-7 flex items-center justify-center text-gray-300
                           hover:text-red-400 transition-colors text-lg shrink-0"
              >
                &times;
              </button>
            </Card>
          ))}

          {/* 添加新动作 */}
          <Card className="p-4 flex gap-2 items-center">
            <input
              type="text"
              placeholder="输入动作名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addExercise()}
              className="flex-1 bg-brand-50 rounded-apple-xs px-3 py-2 text-sm text-gray-900
                         outline-none focus:ring-2 focus:ring-brand-300 transition-shadow"
            />
            <Button onClick={addExercise} className="px-4 py-2 text-sm shrink-0">
              添加
            </Button>
          </Card>

          <button
            onClick={resetToDefault}
            className="text-gray-400 text-sm hover:text-gray-500 transition-colors"
          >
            重置为默认动作
          </button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-50 to-transparent">
          <div className="max-w-sm mx-auto">
            <Button onClick={saveManage} className="w-full py-3 text-[16px]">
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* 训练记录面板 */
  return (
    <div className="min-h-screen flex flex-col px-5 py-8 pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-brand-500 text-[15px] font-medium
                     hover:text-brand-600 transition-colors"
        >
          &larr; 返回
        </button>
        <h1 className="text-[22px] font-semibold text-gray-900 mx-auto">
          {info.emoji} {info.label}
        </h1>
        <button
          onClick={openManage}
          className="text-gray-400 text-lg font-medium hover:text-gray-600 transition-colors w-10 text-right"
        >
          &#9881;
        </button>
      </div>

      {/* 动作列表 */}
      <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
        {exercises.map((exercise) => {
          const isExpanded = expanded.has(exercise.id);
          const sets = setsData[exercise.id] ?? [];

          return (
            <Card key={exercise.id} className="p-4">
              {/* 动作标题 */}
              <button
                onClick={() => toggleExpand(exercise.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[16px] font-medium text-gray-900">
                  {exercise.name}
                </span>
                <span
                  className="text-gray-400 text-lg transition-transform duration-200"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  &rsaquo;
                </span>
              </button>

              {/* 展开的组记录 */}
              {isExpanded && (
                <div className="mt-4 space-y-3">
                  {/* 表头 */}
                  <div className="flex gap-2 text-xs text-gray-400 font-medium">
                    <span className="w-5 shrink-0">组</span>
                    <span className="flex-1 min-w-0">重量 (kg)</span>
                    <span className="flex-1 min-w-0">次数</span>
                    <span className="w-6 shrink-0" />
                  </div>

                  {sets.map((set, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-sm text-gray-500">{i + 1}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        min="0"
                        value={set.weight || ""}
                        onChange={(e) =>
                          updateSet(exercise.id, i, "weight", Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        className="flex-1 min-w-0 bg-brand-50 rounded-apple-xs px-2.5 py-2 text-sm text-gray-900
                                   outline-none focus:ring-2 focus:ring-brand-300 transition-shadow"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        min="0"
                        value={set.reps || ""}
                        onChange={(e) =>
                          updateSet(exercise.id, i, "reps", Math.max(0, parseInt(e.target.value) || 0))
                        }
                        className="flex-1 min-w-0 bg-brand-50 rounded-apple-xs px-2.5 py-2 text-sm text-gray-900
                                   outline-none focus:ring-2 focus:ring-brand-300 transition-shadow"
                      />
                      <button
                        onClick={() => removeSet(exercise.id, i)}
                        className="w-8 h-8 flex items-center justify-center text-gray-300
                                   hover:text-red-400 transition-colors text-lg"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addSet(exercise.id)}
                    className="text-brand-500 text-sm font-medium hover:text-brand-600 transition-colors"
                  >
                    + 添加组
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 底部保存按钮 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-50 to-transparent">
        <div className="max-w-sm mx-auto">
          <Button onClick={handleSave} className="w-full py-3 text-[16px]">
            保存训练记录
          </Button>
        </div>
      </div>
    </div>
  );
}
