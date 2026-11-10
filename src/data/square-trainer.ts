export type Mode = 'mixed' | 'square' | 'root';
export type Task = { n: number; kind: 'square' | 'root'; repeated: boolean };
export function createTasks(mode: Mode, min = 1, max = 20): Task[] {
  const tasks: Task[] = [];
  for (let n = min; n <= max; n++) {
    if (mode !== 'root') tasks.push({ n, kind: 'square', repeated: false });
    if (mode !== 'square') tasks.push({ n, kind: 'root', repeated: false });
  }
  for (let i = tasks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
  }
  return tasks;
}
export const answerFor = (task: Task) => task.kind === 'square' ? task.n * task.n : task.n;
export const expressionFor = (task: Task) => task.kind === 'square' ? `${task.n}²` : `√${task.n * task.n}`;
export function isCorrect(task: Task, input: string): boolean {
  return /^\d+$/.test(input.trim()) && Number(input.trim()) === answerFor(task);
}
/** Space a missed task behind up to three other tasks, then recall it again. */
export function repeatTask(queue: Task[], task: Task): Task[] {
  const result = [...queue];
  result.splice(Math.min(3, result.length), 0, { ...task, repeated: true });
  return result;
}
