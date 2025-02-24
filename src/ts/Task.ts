import { Priority } from "./Priority.js";

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  editing?: boolean;
  createdAt: string;
}
