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
const taskPrioritySelect = document.getElementById('task-priority');
let tasks = [];
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
        li.classList.add('task-item');
        //checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            updateTaskStatus(task.id, checkbox.checked);
        });
        //task details container
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';
        if (task.editing) {
            // editing mode: show input fields
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = task.title;
            titleInput.id = 'edit-title-' + task.id;
            detailsDiv.appendChild(titleInput);
            const descriptionInput = document.createElement('input');
            descriptionInput.type = 'text';
            descriptionInput.value = task.description || '';
            descriptionInput.id = 'edit-description-' + task.id;
            detailsDiv.appendChild(descriptionInput);
            const prioritySelect = document.createElement('select');
            prioritySelect.id = 'edit-priority-' + task.id;
            ['Low', 'Medium', 'High'].forEach(optionVal => {
                const option = document.createElement('option');
                option.value = optionVal;
                option.textContent = optionVal;
                if (task.priority === optionVal)
                    option.selected = true;
                prioritySelect.appendChild(option);
            });
            detailsDiv.appendChild(prioritySelect);
        }
        else {
            // normal mode: show task details
            const detailsSpan = document.createElement('span');
            detailsSpan.textContent = `${task.title} - ${task.description || ''} [Приоритет: ${task.priority}]`;
            detailsDiv.appendChild(detailsSpan);
        }
        //edit button
        const editButton = document.createElement('button');
        editButton.innerHTML = '✏️';
        if (task.editing) {
            editButton.style.opacity = '0.5';
        }
        else {
            editButton.style.opacity = '1';
        }
        editButton.addEventListener('click', () => {
            if (task.editing) {
                // save changes
                const titleInput = document.getElementById('edit-title-' + task.id);
                const descriptionInput = document.getElementById('edit-description-' + task.id);
                const prioritySelect = document.getElementById('edit-priority-' + task.id);
                // update task object
                const updatedTask = Object.assign(Object.assign({}, task), { title: titleInput.value, description: descriptionInput.value, priority: prioritySelect.value, editing: false // exit editing mode
                 });
                updateTask(updatedTask);
            }
            else {
                // enter editing mode
                task.editing = true;
                renderTasks(tasks);
            }
        });
        //delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            deleteTask(task.id);
        });
        li.appendChild(checkbox);
        li.appendChild(detailsDiv);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
}
function populateFormForEdit(task) {
    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description || '';
    taskPrioritySelect.value = task.priority;
    taskForm.removeEventListener('submit', handleAddTask);
    taskForm.addEventListener('submit', function handleEditTask(event) {
        event.preventDefault();
        const updatedTask = {
            id: task.id,
            title: taskTitleInput.value,
            description: taskDescriptionInput.value,
            completed: task.completed,
            priority: taskPrioritySelect.value,
        };
        updateTask(updatedTask);
        taskForm.removeEventListener('submit', handleEditTask);
        taskForm.addEventListener('submit', handleAddTask);
        taskForm.reset();
    });
}
//add task handler
function handleAddTask(event) {
    event.preventDefault();
    const newTask = {
        title: taskTitleInput.value,
        description: taskDescriptionInput.value,
        completed: false,
        priority: taskPrioritySelect.value
    };
    addTask(newTask);
    taskForm.reset();
}
//taskForm.addEventListener('submit', handleAddTask);
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
function deleteTask(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Error deleting task');
            }
            yield loadTasks();
        }
        catch (error) {
            console.error(error);
        }
    });
}
function updateTask(task) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });
            if (!response.ok) {
                throw new Error('Ошибка при обновлении задачи');
            }
            yield loadTasks();
        }
        catch (error) {
            console.error(error);
        }
    });
}
function updateTaskStatus(id, completed) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const updatedTask = { completed };
            const response = yield fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });
            if (!response.ok) {
                throw new Error('Error updating task status');
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
        completed: false,
        priority: taskPrioritySelect.value
    };
    addTask(newTask);
    taskForm.reset();
});
loadTasks();
//# sourceMappingURL=app.js.map