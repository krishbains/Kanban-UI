import { Column } from "@/app/Board";

const defaultHSVA = {
  'bg-slate-600': { h: 30, s: 60, v: 80, a: 1 },
  'bg-slate-700': { h: 120, s: 60, v: 80, a: 1 },
  'bg-slate-900': { h: 270, s: 60, v: 80, a: 1 },
  'bg-slate-800': { h: 0, s: 0, v: 50, a: 1 },
  'bg-blue-900': { h: 210, s: 100, v: 56, a: 1 },
};

export const defaultSchema: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    bg: 'bg-slate-600',
    hsva: defaultHSVA['bg-slate-600'],
    tasks: [
      { id: '1', title: 'Buy milk', bg: 'bg-blue-800' },
      { id: '2', title: 'Finish project', bg: 'bg-green-800' },
      { id: '3', title: 'Call mom', bg: 'bg-red-800' },
    ],
  },
  {
    id: 'inProgress',
    title: 'In Progress',
    bg: 'bg-slate-700',
    hsva: defaultHSVA['bg-slate-700'],
    tasks: [
      { id: '4', title: 'Write report', bg: 'bg-yellow-700' },
      { id: '5', title: 'Fix bug', bg: 'bg-pink-700' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    bg: 'bg-slate-900',
    hsva: defaultHSVA['bg-slate-900'],
    tasks: [],
  },
  {
    id: 'trashed',
    title: 'Trashed',
    bg: 'bg-slate-800',
    hsva: defaultHSVA['bg-slate-800'],
    tasks: [],
  },
]; 