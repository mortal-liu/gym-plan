import type { Exercise } from "../types";
import { getCustomExercises } from "../utils/storage";

export const pushExercises: Exercise[] = [
  { id: "push-1", name: "杠铃卧推", mode: "strength" },
  { id: "push-2", name: "上斜哑铃卧推", mode: "strength" },
  { id: "push-3", name: "杠铃肩推", mode: "strength" },
  { id: "push-4", name: "侧平举", mode: "strength" },
  { id: "push-5", name: "哑铃弯举", mode: "strength" },
  { id: "push-6", name: "锤式弯举", mode: "strength" },
];

export const pullExercises: Exercise[] = [
  { id: "pull-1", name: "引体向上", mode: "strength" },
  { id: "pull-2", name: "杠铃划船", mode: "strength" },
  { id: "pull-3", name: "高位下拉", mode: "strength" },
  { id: "pull-4", name: "坐姿绳索划船", mode: "strength" },
  { id: "pull-5", name: "绳索三头下压", mode: "strength" },
  { id: "pull-6", name: "双杠臂屈伸", mode: "strength" },
];

export const legsExercises: Exercise[] = [
  { id: "legs-1", name: "杠铃深蹲", mode: "strength" },
  { id: "legs-2", name: "硬拉", mode: "strength" },
  { id: "legs-3", name: "腿举", mode: "strength" },
  { id: "legs-4", name: "腿屈伸", mode: "strength" },
  { id: "legs-5", name: "腿弯举", mode: "strength" },
  { id: "legs-6", name: "提踵", mode: "strength" },
];

const defaults: Record<string, Exercise[]> = {
  push: pushExercises,
  pull: pullExercises,
  legs: legsExercises,
};

export function getExercises(dayType: string): Exercise[] {
  const custom = getCustomExercises(dayType);
  if (custom.length > 0) return custom;
  return defaults[dayType] ?? [];
}

export function getDefaultExercises(dayType: string): Exercise[] {
  return defaults[dayType] ?? [];
}
