import type { WorkoutRecord, Exercise } from "../types";

const STORAGE_KEY = "gym-plan-workouts";
const CUSTOM_EX_KEY = "gym-plan-custom-exercises";

function getAll(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWorkout(record: WorkoutRecord): void {
  const workouts = getAll();
  workouts.push(record);
  workouts.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
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

const REST_DAYS_KEY = "gym-plan-rest-days";

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
