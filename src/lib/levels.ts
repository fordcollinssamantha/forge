export const LEVELS = [
  { level: 1, name: "Just Showed Up", min: 0, max: 10 },
  { level: 2, name: "Warming Up", min: 11, max: 30 },
  { level: 3, name: "Building Momentum", min: 31, max: 60 },
  { level: 4, name: "In the Zone", min: 61, max: 100 },
  { level: 5, name: "Locked In", min: 101, max: Infinity },
] as const;

export function getLevel(points: number) {
  const level = LEVELS.find((l) => points >= l.min && points <= l.max) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);
  const progressInLevel = points - level.min;
  const levelRange = nextLevel ? nextLevel.min - level.min : 1;
  const progress = nextLevel ? Math.min(progressInLevel / levelRange, 1) : 1;

  return {
    ...level,
    points,
    progress,
    pointsToNext: nextLevel ? nextLevel.min - points : 0,
    nextLevelName: nextLevel?.name || null,
    isMax: !nextLevel,
  };
}
