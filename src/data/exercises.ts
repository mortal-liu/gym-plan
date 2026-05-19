import type { Exercise } from "../types";
import { getCustomExercises } from "../utils/storage";

export const pushExercises: Exercise[] = [
  { id: "push-1", name: "杠铃卧推" },
  { id: "push-2", name: "上斜哑铃卧推" },
  { id: "push-3", name: "杠铃肩推" },
  { id: "push-4", name: "侧平举" },
  { id: "push-5", name: "绳索三头下压" },
  { id: "push-6", name: "双杠臂屈伸" },
];

export const pullExercises: Exercise[] = [
  { id: "pull-1", name: "引体向上" },
  { id: "pull-2", name: "杠铃划船" },
  { id: "pull-3", name: "高位下拉" },
  { id: "pull-4", name: "坐姿绳索划船" },
  { id: "pull-5", name: "哑铃弯举" },
  { id: "pull-6", name: "锤式弯举" },
];

export const legsExercises: Exercise[] = [
  { id: "legs-1", name: "杠铃深蹲" },
  { id: "legs-2", name: "硬拉" },
  { id: "legs-3", name: "腿举" },
  { id: "legs-4", name: "腿屈伸" },
  { id: "legs-5", name: "腿弯举" },
  { id: "legs-6", name: "提踵" },
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
