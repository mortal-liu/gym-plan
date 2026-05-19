import type { WorkoutRecord } from "../types";

const STORAGE_KEY = "gym-plan-workouts";

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
