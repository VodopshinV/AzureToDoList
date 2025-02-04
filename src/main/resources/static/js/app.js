"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_URL = '/api/tasks';
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskList = document.getElementById('task-list');
function loadTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(API_URL);
            if (!response.ok) {
                throw new Error('Error loading tasks');
            }
            const tasks = yield response.json();
            renderTasks(tasks);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.title} - ${task.description || ''} [${task.completed ? 'Done' : 'In progress'}]`;
        taskList.appendChild(li);
    });
}
function addTask(task) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            if (!response.ok) {
                throw new Error('Error creating task');
            }
            yield loadTasks();
        }
        catch (error) {
            console.error(error);
        }
    });
}
taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newTask = {
        title: taskTitleInput.value,
        description: taskDescriptionInput.value,
        completed: false
    };
    addTask(newTask);
    taskForm.reset();
});
loadTasks();
//# sourceMappingURL=app.js.map