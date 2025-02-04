interface Task {
    id?: number;
    title: string;
    description?: string;
    completed: boolean;
}

const API_URL = '/api/tasks';

const taskForm = document.getElementById('task-form') as HTMLFormElement;
const taskTitleInput = document.getElementById('task-title') as HTMLInputElement;
const taskDescriptionInput = document.getElementById('task-description') as HTMLInputElement;
const taskList = document.getElementById('task-list') as HTMLUListElement;

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if(!response.ok) {
            throw new Error('Error loading tasks');
        }
        const tasks: Task[] = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error(error);
    }
}

function renderTasks(tasks: Task[]) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent  = `${task.title} - ${task.description || ''} [${task.completed ? 'Done' : 'In progress'}]`;
        taskList.appendChild(li);
    });
}

async function addTask(task: Task) {
    try{
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
    });

    if(!response.ok) {
        throw new Error('Error creating task'); 
    }
    await loadTasks();
    } catch (error) {    
        console.error(error);
    }
}

taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newTask: Task = {
      title: taskTitleInput.value,
      description: taskDescriptionInput.value,
      completed: false
    };
    addTask(newTask);
    taskForm.reset();
  });

  loadTasks();