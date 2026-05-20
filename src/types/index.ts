/** 动作模式 */
export type ExerciseMode = "strength" | "cardio";

/** 一组训练记录 */
export interface SetRecord {
  weight?: number; // 重量(kg)
  reps?: number;   // 次数
  duration?: number; // 持续时间(分钟)，有氧模式用
}

/** 一个动作的完整记录 */
export interface ExerciseRecord {
  exerciseId: string;
  sets: SetRecord[];
}

/** 一次完整的训练记录 */
export interface WorkoutRecord {
  id: string;
  dayType: "push" | "pull" | "legs";
  date: string;         // ISO 日期 "2026-05-19"
  exercises: ExerciseRecord[];
}

/** 预设动作定义 */
export interface Exercise {
  id: string;
  name: string;
  mode: ExerciseMode;
}
