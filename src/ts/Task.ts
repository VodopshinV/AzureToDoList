import { Priority } from "./Priority";

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  editing?: boolean;
  createdAt: string;
}
