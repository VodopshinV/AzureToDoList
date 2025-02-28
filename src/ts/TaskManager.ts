import { Task } from "./Task.js";
import { Priority } from "./Priority.js";

import { TaskError } from "./Errors/TaskError.js";

export class TaskManager {
  private tasks: Task[] = [];
  private API_URL: string = '/api/tasks';
  private localStorageKey: string = 'tasks';

  // animations for tasks
  private animationForTask: { [key: number]: string } = {};

    // load tasks from server (fallback to localStorage)
    async loadTasks(): Promise<void> {
        try {
          const response = await fetch(this.API_URL);
          if (!response.ok) {
            throw new TaskError('Error loading tasks from server' + response.statusText);
          }
          try {
            this.tasks = await response.json();
          } catch (jsonError: unknown) {
            if (jsonError instanceof Error) {
              throw new TaskError('Invalid JSON response: ' + jsonError.message);
            } else {
              throw new TaskError('Invalid JSON response');
            }
          }
          this.saveToLocalStorage();
        } catch (error) {
          console.error("Server error, loading tasks from localStorage:", error);
          this.tasks = this.getFromLocalStorage();
        }
      }

    // save tasks to localStorage
    private saveToLocalStorage(): void {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.tasks));
    }

    // get tasks from localStorage
    private getFromLocalStorage(): Task[] {
        const stored = localStorage.getItem(this.localStorageKey);
    return stored ? JSON.parse(stored) : [];
    }

    // add a new task
    async addTask(task: Task): Promise<void> {
        try {
        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new TaskError('Error creating task');
        }
        await this.loadTasks();
        } catch (error) {
            console.error("TaskManager addTask error:", error);
            throw error;
        }
    }

    // update an existing task
    async updateTask(task: Task): Promise<void> {
        try {
        const response = await fetch(`${this.API_URL}/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new TaskError('Error updating task');
        }
        await this.loadTasks();
        } catch (error) {
            console.error("TaskManager updateTask error:", error);
            throw error;
        }
    }

    // update task status
    async updateTaskStatus(taskId: number, completed: boolean): Promise<void> {
        try {
          const updatedTask = { completed };
          const response = await fetch(`${this.API_URL}/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask)
          });
          if (!response.ok) {
            throw new TaskError('Error updating task status');
          }
          // save animation for task
          this.animationForTask[taskId] = completed ? "fall-animation" : "rise-animation";
          await this.loadTasks();
        } catch (error) {
            console.error("TaskManager updateTaskStatus error:", error);
            throw error;
        }
      }

    // delete a task
    async deleteTask(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.API_URL}/${id}`, {
            method: 'DELETE'
            });
            if (!response.ok) {
            throw new TaskError('Error deleting task');
            }
            await this.loadTasks();
        } catch (error) {
            console.error("TaskManager deleteTask error:", error);
            throw error;
        }
    }

    getAnimationForTask(taskId: number): string | undefined {
        return this.animationForTask[taskId];
    }
    
    // delete animation for task
    deleteAnimationForTask(taskId: number): void {
        delete this.animationForTask[taskId];
    }
    

    // get filtered and sorted tasks
    getFilteredAndSortedTasks(
    filterStatus: 'all' | 'active' | 'completed',
    sortOption: 'priority-asc' | 'priority-desc' | 'date-asc' | 'date-desc',
    searchQuery: string
    ): Task[] {
        let filtered = [...this.tasks];
        
        // status filter
        if (filterStatus === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (filterStatus === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }
        
        // search query filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query))
            );
        }

        // sort
        if (sortOption === 'priority-asc') {
            filtered.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
            } else if (sortOption === 'priority-desc') {
            filtered.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
            } else if (sortOption === 'date-asc') {
            filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            } else if (sortOption === 'date-desc') {
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
          
        return filtered;
    }

    // get priority value
    public getPriorityValue(priority: Priority): number {
        switch (priority) {
            case Priority.Low: return 1;
            case Priority.Medium: return 2;
            case Priority.High: return 3;
            default: return 0;
        }
    }
        
    //get all tasks
    getTasks(): Task[] {
        return this.tasks;
    }
};