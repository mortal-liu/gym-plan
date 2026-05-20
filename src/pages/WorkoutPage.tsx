import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { SetRecord, Exercise, WorkoutRecord, ExerciseMode } from "../types";
import { getExercises, getDefaultExercises } from "../data/exercises";
import { saveWorkout, updateWorkout, saveCustomExercises, saveDraft, getDraft, clearDraft, getWorkouts, toggleRestDay, appendToTodayWorkout } from "../utils/storage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

const dayInfo: Record<string, { label: string; emoji: string }> = {
  push: { label: "推日", emoji: "🏋️" },
  pull: { label: "拉日", emoji: "💪" },
  legs: { label: "蹲日", emoji: "🦵" },
};

export default function WorkoutPage() {
  const { dayType } = useParams<{ dayType: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const info = dayInfo[dayType ?? ""];

  const editRecord = (location.state as { record?: WorkoutRecord })?.record ?? null;

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (editRecord) return getExercises(dayType ?? "");
    return getExercises(dayType ?? "");
  });

  const [setsData, setSetsData] = useState<Record<string, SetRecord[]>>(() => {
    if (editRecord) {
      const data: Record<string, SetRecord[]> = {};
      for (const er of editRecord.exercises) data[er.exerciseId] = er.sets;
      return data;
    }
    const draft = getDraft(dayType ?? "");
    if (draft) return draft;
    return initSets(getExercises(dayType ?? ""));
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isManaging, setIsManaging] = useState(false);

  const [modal, setModal] = useState<{
    show: boolean; emoji: string; message: string;
    actions?: { label: string; onClick: () => void; primary?: boolean }[];
  }>({ show: false, emoji: "", message: "" });

  // 有氧分钟数输入弹窗
  const [cardioModal, setCardioModal] = useState(false);
  const [cardioMinutes, setCardioMinutes] = useState("");

  // 管理面板状态
  const [editList, setEditList] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState("");
  const [newMode, setNewMode] = useState<ExerciseMode>("strength");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveDraftDebounced = useCallback((data: Record<string, SetRecord[]>) => {
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => saveDraft(dayType ?? "", data), 800);
  }, [dayType]);

  useEffect(() => {
    if (editRecord) return;
    const list = getExercises(dayType ?? "");
    setExercises(list);
    const draft = getDraft(dayType ?? "");
    setSetsData(draft ?? initSets(list));
    setExpanded(new Set());
    setIsManaging(false);

    // 今天已有训练记录时提醒
    if (!editRecord) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayWorkouts = getWorkouts().filter((w) => w.date === todayStr);
      if (todayWorkouts.length > 0) {
        setModal({
          show: true, emoji: "💭",
          message: "今天已经练过一次了～想怎么安排？",
          actions: [
            {
              label: "休息",
              onClick: () => {
                toggleRestDay(todayStr);
                setModal((m) => ({ ...m, show: false }));
                navigate("/");
              },
            },
            {
              label: "有氧",
              onClick: () => {
                setModal((m) => ({ ...m, show: false }));
                setCardioModal(true);
              },
            },
            {
              label: "加练",
              onClick: () => setModal((m) => ({ ...m, show: false })),
              primary: true,
            },
          ],
        });
      }
    }
  }, [dayType]);

  function showAlert(message: string) {
    setModal({ show: true, emoji: "", message });
  }

  function initSets(list: Exercise[]): Record<string, SetRecord[]> {
    const initial: Record<string, SetRecord[]> = {};
    for (const ex of list) {
      initial[ex.id] = ex.mode === "cardio" ? [{ duration: 0 }] : [{ weight: 0, reps: 0 }];
    }
    return initial;
  }

  function emptySet(mode: ExerciseMode): SetRecord {
    return mode === "cardio" ? { duration: 0 } : { weight: 0, reps: 0 };
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

  function updateSet(exerciseId: string, setIndex: number, field: string, value: number) {
    setSetsData((prev) => {
      const sets = [...prev[exerciseId]];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      const next = { ...prev, [exerciseId]: sets };
      saveDraftDebounced(next);
      return next;
    });
  }

  function addSet(exerciseId: string) {
    setSetsData((prev) => {
      const next = { ...prev, [exerciseId]: [...prev[exerciseId], { weight: 0, reps: 0 }] };
      saveDraftDebounced(next);
      return next;
    });
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setSetsData((prev) => {
      const sets = prev[exerciseId].filter((_, i) => i !== setIndex);
      const next = { ...prev, [exerciseId]: sets.length > 0 ? sets : [{ weight: 0, reps: 0 }] };
      saveDraftDebounced(next);
      return next;
    });
  }

  function toggleExpand(exerciseId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }

  function handleSave() {
    const exerciseRecords = exercises
      .map((ex) => ({
        exerciseId: ex.id,
        sets: setsData[ex.id]?.filter((s) => {
          if (ex.mode === "cardio") return (s.duration ?? 0) > 0;
          return (s.weight ?? 0) > 0 || (s.reps ?? 0) > 0;
        }) ?? [],
      }))
      .filter((er) => er.sets.length > 0);

    if (exerciseRecords.length === 0) {
      showAlert("请至少记录一组训练数据");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    let isDoubleDay = false;
    if (!editRecord) {
      isDoubleDay = getWorkouts().filter((w) => w.date === today).length > 0;
    }

    if (editRecord) {
      updateWorkout(editRecord.id, { ...editRecord, exercises: exerciseRecords });
    } else {
      saveWorkout({
        id: Date.now().toString(),
        dayType: dayType as "push" | "pull" | "legs",
        date: today,
        exercises: exerciseRecords,
      });
    }

    clearDraft(dayType ?? "");

    if (isDoubleDay) {
      setModal({
        show: true, emoji: "🔥",
        message: "练完了！太强了bro，一天两练～记得好好吃饭好好睡觉，身体才能变强",
        actions: [{
          label: "好的",
          onClick: () => navigate("/history"),
          primary: true,
        }],
      });
    } else {
      navigate("/history");
    }
  }

  /* 有氧分钟数确认 */
  function confirmCardio() {
    const mins = parseInt(cardioMinutes) || 0;
    if (mins <= 0) return;
    const exId = `cardio-${Date.now()}`;
    appendToTodayWorkout(exId, mins);
    setCardioModal(false);
    setCardioMinutes("");
    setModal({
      show: true, emoji: "🔥",
      message: "有氧也补上了，一天两练太强了bro～好好休息，明天继续！",
      actions: [{ label: "好的", onClick: () => navigate("/history"), primary: true }],
    });
  }

  /* 动作管理 */

  function openManage() {
    setEditList([...exercises]);
    setNewName("");
    setNewMode("strength");
    setEditingId(null);
    setIsManaging(true);
  }

  function addExercise() {
    const name = newName.trim();
    if (!name) return;
    if (editList.some((ex) => ex.name === name)) {
      showAlert("该动作已存在");
      return;
    }
    setEditList([...editList, { id: Date.now().toString(), name, mode: newMode }]);
    setNewName("");
  }

  function removeExercise(id: string) {
    if (editList.length <= 1) { showAlert("至少保留一个动作"); return; }
    setEditList(editList.filter((ex) => ex.id !== id));
  }

  function startRename(ex: Exercise) {
    setEditingId(ex.id);
    setRenameValue(ex.name);
  }

  function confirmRename() {
    if (!editingId) return;
    const name = renameValue.trim();
    if (!name) return;
    setEditList(editList.map((ex) => (ex.id === editingId ? { ...ex, name } : ex)));
    setEditingId(null);
  }

  function resetToDefault() {
    setEditList(getDefaultExercises(dayType ?? ""));
  }

  function saveManage() {
    saveCustomExercises(dayType ?? "", editList);
    setSetsData((prev) => {
      const next: Record<string, SetRecord[]> = {};
      for (const ex of editList) {
        next[ex.id] = prev[ex.id] ?? [emptySet(ex.mode)];
      }
      saveDraftDebounced(next);
      return next;
    });
    setExercises(editList);
    setIsManaging(false);
  }

  function cancelManage() { setIsManaging(false); }

  /* 管理面板 */
  if (isManaging) {
    return (
      <div className="min-h-screen flex flex-col px-5 py-8">
        <div className="flex items-center mb-6">
          <button onClick={cancelManage} className="text-brand-500 text-[15px] font-medium hover:text-brand-600 transition-colors">&larr; 返回</button>
          <h1 className="text-[22px] font-semibold text-gray-900 mx-auto">管理动作</h1>
          <div className="w-10" />
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          {editList.map((ex) => (
            <Card key={ex.id} className="p-4 flex items-center gap-2">
              <div className="flex-1">
                {editingId === ex.id ? (
                  <div className="flex gap-2">
                    <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && confirmRename()} onBlur={confirmRename} autoFocus
                      className="flex-1 bg-brand-50 rounded-apple-xs px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-300" />
                    <button onClick={confirmRename} className="text-brand-500 text-xs font-medium shrink-0 px-2">确定</button>
                  </div>
                ) : (
                  <button onClick={() => startRename(ex)} className="text-left text-[16px] font-medium text-gray-900 hover:text-brand-500 transition-colors">
                    {ex.name}
                  </button>
                )}
                <span className="text-[11px] text-gray-400">{ex.mode === "cardio" ? "有氧 · 分钟" : "力量 · 重量×次数"}</span>
              </div>
              <button onClick={() => removeExercise(ex.id)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors text-lg shrink-0">&times;</button>
            </Card>
          ))}
          <Card className="p-4 space-y-3">
            <input type="text" placeholder="输入动作名称" value={newName}
              onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addExercise()}
              className="w-full bg-brand-50 rounded-apple-xs px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-300 transition-shadow" />
            <div className="flex gap-1 bg-brand-50 rounded-apple-xs p-1">
              <button onClick={() => setNewMode("strength")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                  ${newMode === "strength" ? "bg-white text-brand-500 shadow-sm" : "text-gray-400"}`}>
                力量
              </button>
              <button onClick={() => setNewMode("cardio")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                  ${newMode === "cardio" ? "bg-white text-brand-500 shadow-sm" : "text-gray-400"}`}>
                有氧
              </button>
            </div>
            <Button onClick={addExercise} className="w-full py-2 text-sm">添加</Button>
          </Card>
          <button onClick={resetToDefault} className="text-gray-400 text-sm hover:text-gray-500 transition-colors">重置为默认动作</button>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 safe-bottom bg-gradient-to-t from-brand-50 to-transparent">
          <div className="max-w-sm mx-auto">
            <Button onClick={saveManage} className="w-full py-3 text-[16px]">保存</Button>
          </div>
        </div>
        <Modal open={modal.show} onClose={() => setModal((m) => ({ ...m, show: false }))} actions={modal.actions}>
          <span className="text-[40px]">{modal.emoji}</span>
          <p className="text-[15px] text-gray-700 mt-3 leading-relaxed">{modal.message}</p>
        </Modal>
      </div>
    );
  }

  /* 训练记录面板 */
  return (
    <div className="min-h-screen flex flex-col px-5 py-8 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate("/")} className="text-brand-500 text-[15px] font-medium hover:text-brand-600 transition-colors">&larr; 返回</button>
        <h1 className="text-[22px] font-semibold text-gray-900 mx-auto">
          {info.emoji} {info.label}
          {editRecord && <span className="text-sm text-gray-400 ml-2">(编辑)</span>}
        </h1>
        <button onClick={openManage} className="text-gray-400 text-lg font-medium hover:text-gray-600 transition-colors w-10 text-right">&#9881;</button>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
        {exercises.map((exercise) => {
          const isExpanded = expanded.has(exercise.id);
          const sets = setsData[exercise.id] ?? [];
          const isCardio = exercise.mode === "cardio";

          return (
            <Card key={exercise.id} className="p-4">
              <button onClick={() => toggleExpand(exercise.id)} className="flex items-center justify-between w-full text-left">
                <span className="text-[16px] font-medium text-gray-900">{exercise.name}</span>
                <span className="text-gray-400 text-lg transition-transform duration-200"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>&rsaquo;</span>
              </button>

              {isExpanded && (
                <div className="mt-4 space-y-3">
                  {isCardio ? (
                    <div>
                      <div className="text-xs text-gray-400 font-medium mb-2">时间 (分钟)</div>
                      <input type="number" inputMode="numeric" placeholder="0" min="0"
                        value={sets[0]?.duration || ""}
                        onChange={(e) => updateSet(exercise.id, 0, "duration", Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-brand-50 rounded-apple-xs px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-300 transition-shadow" />
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 text-xs text-gray-400 font-medium">
                        <span className="w-5 shrink-0">组</span>
                        <span className="flex-1 min-w-0">重量 (kg)</span>
                        <span className="flex-1 min-w-0">次数</span>
                        <span className="w-6 shrink-0" />
                      </div>
                      {sets.map((set, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-5 shrink-0 text-sm text-gray-500">{i + 1}</span>
                          <input type="number" inputMode="decimal" placeholder="0" min="0"
                            value={set.weight || ""}
                            onChange={(e) => updateSet(exercise.id, i, "weight", Math.max(0, parseFloat(e.target.value) || 0))}
                            className="flex-1 min-w-0 bg-brand-50 rounded-apple-xs px-2.5 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-300 transition-shadow" />
                          <input type="number" inputMode="numeric" placeholder="0" min="0"
                            value={set.reps || ""}
                            onChange={(e) => updateSet(exercise.id, i, "reps", Math.max(0, parseInt(e.target.value) || 0))}
                            className="flex-1 min-w-0 bg-brand-50 rounded-apple-xs px-2.5 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-300 transition-shadow" />
                          <button onClick={() => removeSet(exercise.id, i)}
                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors text-lg">&times;</button>
                        </div>
                      ))}
                      <button onClick={() => addSet(exercise.id)} className="text-brand-500 text-sm font-medium hover:text-brand-600 transition-colors">+ 添加组</button>
                    </>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 safe-bottom bg-gradient-to-t from-brand-50 to-transparent">
        <div className="max-w-sm mx-auto">
          <Button onClick={handleSave} className="w-full py-3 text-[16px]">
            {editRecord ? "更新训练记录" : "保存训练记录"}
          </Button>
        </div>
      </div>

      <Modal open={modal.show} onClose={() => setModal((m) => ({ ...m, show: false }))} actions={modal.actions}>
        <span className="text-[40px]">{modal.emoji}</span>
        <p className="text-[15px] text-gray-700 mt-3 leading-relaxed">{modal.message}</p>
      </Modal>

      {/* 有氧分钟数弹窗 */}
      <Modal open={cardioModal} onClose={() => setCardioModal(false)}>
        <span className="text-[40px]">🏃</span>
        <p className="text-[15px] text-gray-700 mt-3 leading-relaxed mb-2">做了多久有氧？</p>
        <input type="number" inputMode="numeric" placeholder="分钟" min="1"
          value={cardioMinutes}
          onChange={(e) => setCardioMinutes(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmCardio()}
          className="w-full bg-brand-50 rounded-apple-xs px-3 py-2 text-lg text-center text-gray-900 outline-none focus:ring-2 focus:ring-brand-300 transition-shadow" />
        <button onClick={confirmCardio}
          className="mt-4 w-full py-2.5 bg-brand-500 text-white text-[15px] font-medium rounded-apple-xs hover:bg-brand-600 active:scale-[0.97] transition-all duration-200">
          保存
        </button>
      </Modal>
    </div>
  );
}
