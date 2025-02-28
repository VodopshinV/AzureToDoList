import fetchMock from 'jest-fetch-mock';

import { TaskManager } from '../src/ts/TaskManager';
import { Task } from '../src/ts/Task';
import { Priority } from '../src/ts/Priority';

describe("TaskManager", () => {
    let taskManager: TaskManager;

    beforeEach(() => { 
        fetchMock.resetMocks();
        taskManager = new TaskManager();
    });

    test("should add a new task and then retrieve it", async () => {
        const newTask: Task = {
            title: "Test Task",
            completed: false,
            description: "Test Description",
            priority: Priority.Medium,
            createdAt: new Date().toISOString()
        };

        fetchMock.mockResponseOnce(JSON.stringify({ ...newTask, id: 1 }));
    
        fetchMock.mockResponseOnce(JSON.stringify([{ ...newTask, id: 1 }]));

        await taskManager.addTask(newTask);
        await taskManager.loadTasks();
        const tasks = taskManager.getTasks();

        expect(tasks.length).toBeGreaterThan(0);
        const addedTask = tasks.find(task => task.title === "Test Task");
        expect(addedTask).toBeDefined();
        expect(addedTask?.priority).toBe(Priority.Medium);
    });

    test("should filter tasks by status", () => {
        //data imitation
        const tasks: Task[] = [
            {id: 1, title: "Task 1", completed: false, priority: Priority.Low, createdAt: new Date().toISOString()},
            {id: 2, title: "Task 2", completed: true, priority: Priority.Medium, createdAt: new Date().toISOString()},
            {id: 3, title: "Task 3", completed: false, priority: Priority.High, createdAt: new Date().toISOString()}
        ];

        (taskManager as any).tasks = tasks;

        const activeTasks = taskManager.getFilteredAndSortedTasks('active', 'date-asc', '');
        const completedTasks = taskManager.getFilteredAndSortedTasks('completed', 'date-asc', '');

        expect(activeTasks.length).toBe(2);
        expect(completedTasks.length).toBe(1);
        expect(activeTasks[0].id).toBe(1);
        expect(completedTasks[0].id).toBe(2);
    });

    test("should sort tasks by creation date in descending order", () => {
        //data imitation
        const tasks: Task[] = [
            { id: 1, title: "Task 1", completed: false, priority: Priority.Low, createdAt: "2025-02-28T15:37:38.321Z" },
            { id: 2, title: "Task 2", completed: true, priority: Priority.Medium, createdAt: "2025-02-28T15:37:39.321Z" },
            { id: 3, title: "Task 3", completed: false, priority: Priority.High, createdAt: "2025-02-28T15:37:40.321Z" }
        ];

        (taskManager as any).tasks = tasks;

        const sorted = taskManager.getFilteredAndSortedTasks('all', 'date-desc', '');
        expect(sorted[0].id).toBe(3);
        expect(sorted[1].id).toBe(2);
        expect(sorted[2].id).toBe(1);
    });
});