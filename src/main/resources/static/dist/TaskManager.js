var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Priority } from "./Priority.js";
export class TaskManager {
    constructor() {
        this.tasks = [];
        this.API_URL = '/api/tasks';
        this.localStorageKey = 'tasks';
        // animations for tasks
        this.animationForTask = {};
    }
    // load tasks from server (fallback to localStorage)
    loadTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.API_URL);
                if (!response.ok) {
                    throw new Error('Error loading tasks from server');
                }
                this.tasks = yield response.json();
                this.saveToLocalStorage();
            }
            catch (error) {
                console.error("Server error, loading tasks from localStorage:", error);
                this.tasks = this.getFromLocalStorage();
            }
        });
    }
    // save tasks to localStorage
    saveToLocalStorage() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.tasks));
    }
    // get tasks from localStorage
    getFromLocalStorage() {
        const stored = localStorage.getItem(this.localStorageKey);
        return stored ? JSON.parse(stored) : [];
    }
    // add a new task
    addTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
                if (!response.ok) {
                    throw new Error('Error creating task');
                }
                yield this.loadTasks();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    // update an existing task
    updateTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.API_URL}/${task.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(task)
                });
                if (!response.ok) {
                    throw new Error('Error updating task');
                }
                yield this.loadTasks();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    // update task status
    updateTaskStatus(taskId, completed) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedTask = { completed };
                const response = yield fetch(`${this.API_URL}/${taskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedTask)
                });
                if (!response.ok) {
                    throw new Error('Error updating task status');
                }
                // save animation for task
                this.animationForTask[taskId] = completed ? "fall-animation" : "rise-animation";
                yield this.loadTasks();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    // delete a task
    deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.API_URL}/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error('Error deleting task');
                }
                yield this.loadTasks();
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    getAnimationForTask(taskId) {
        return this.animationForTask[taskId];
    }
    // delete animation for task
    deleteAnimationForTask(taskId) {
        delete this.animationForTask[taskId];
    }
    // get filtered and sorted tasks
    getFilteredAndSortedTasks(filterStatus, sortOption, searchQuery) {
        let filtered = [...this.tasks];
        // status filter
        if (filterStatus === 'active') {
            filtered = filtered.filter(task => !task.completed);
        }
        else if (filterStatus === 'completed') {
            filtered = filtered.filter(task => task.completed);
        }
        // search query filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(task => task.title.toLowerCase().includes(query) ||
                (task.description && task.description.toLowerCase().includes(query)));
        }
        // sort
        if (sortOption === 'priority-asc') {
            filtered.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
        }
        else if (sortOption === 'priority-desc') {
            filtered.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
        }
        else if (sortOption === 'date-asc') {
            filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        else if (sortOption === 'date-desc') {
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return filtered;
    }
    // get priority value
    getPriorityValue(priority) {
        switch (priority) {
            case Priority.Low: return 1;
            case Priority.Medium: return 2;
            case Priority.High: return 3;
            default: return 0;
        }
    }
    //get all tasks
    getTasks() {
        return this.tasks;
    }
}
;
//# sourceMappingURL=TaskManager.js.map