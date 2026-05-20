import type { WorkoutRecord, Exercise, SetRecord } from "../types";

const STORAGE_KEY = "gym-plan-workouts";
const CUSTOM_EX_KEY = "gym-plan-custom-exercises";
const REST_DAYS_KEY = "gym-plan-rest-days";
const DRAFT_KEY = "gym-plan-drafts";

function getAll(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(workouts: WorkoutRecord[]): void {
  workouts.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

export function saveWorkout(record: WorkoutRecord): void {
  const workouts = getAll();
  workouts.push(record);
  saveAll(workouts);
}

export function updateWorkout(id: string, record: WorkoutRecord): void {
  const workouts = getAll();
  const idx = workouts.findIndex((w) => w.id === id);
  if (idx >= 0) {
    workouts[idx] = record;
    saveAll(workouts);
  }
}

export function deleteWorkout(id: string): void {
  const workouts = getAll().filter((w) => w.id !== id);
  saveAll(workouts);
}

export function getWorkouts(): WorkoutRecord[] {
  return getAll();
}

export function getWorkoutsByType(dayType: WorkoutRecord["dayType"]): WorkoutRecord[] {
  return getAll().filter((w) => w.dayType === dayType);
}

export function getWorkoutById(id: string): WorkoutRecord | undefined {
  return getAll().find((w) => w.id === id);
}

/* 自定义动作管理 */

type CustomExercisesData = Record<string, Exercise[]>;

function getAllCustom(): CustomExercisesData {
  try {
    const raw = localStorage.getItem(CUSTOM_EX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCustomExercises(dayType: string): Exercise[] {
  return getAllCustom()[dayType] ?? [];
}

export function saveCustomExercises(dayType: string, exercises: Exercise[]): void {
  const all = getAllCustom();
  all[dayType] = exercises;
  localStorage.setItem(CUSTOM_EX_KEY, JSON.stringify(all));
}

/* 休息日管理 */

export function getRestDays(): string[] {
  try {
    const raw = localStorage.getItem(REST_DAYS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleRestDay(date: string): void {
  const days = getRestDays();
  const idx = days.indexOf(date);
  if (idx >= 0) {
    days.splice(idx, 1);
  } else {
    days.push(date);
  }
  localStorage.setItem(REST_DAYS_KEY, JSON.stringify(days));
}

/* 有氧追加到当天第一条记录 */

export function appendToTodayWorkout(exerciseId: string, duration: number): void {
  const today = new Date().toISOString().slice(0, 10);
  const workouts = getAll();
  const todayWorkout = workouts.find((w) => w.date === today);
  if (todayWorkout) {
    todayWorkout.exercises.push({
      exerciseId,
      sets: [{ duration }],
    });
    saveAll(workouts);
  }
}

/* 训练草稿管理 */

export function saveDraft(dayType: string, data: Record<string, SetRecord[]>): void {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const drafts = raw ? JSON.parse(raw) : {};
    drafts[dayType] = data;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  } catch { /* ignore */ }
}

export function getDraft(dayType: string): Record<string, SetRecord[]> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw)[dayType] ?? null;
  } catch {
    return null;
  }
}

export function clearDraft(dayType: string): void {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const drafts = JSON.parse(raw);
    delete drafts[dayType];
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
  } catch { /* ignore */ }
}
