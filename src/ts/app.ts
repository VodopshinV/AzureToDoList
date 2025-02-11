interface Task {
    id?: number;
    title: string;
    description?: string;
    completed: boolean;
    priority: string; //low, medium, high
    editing?: boolean;
}

const API_URL = '/api/tasks';

const taskForm = document.getElementById('task-form') as HTMLFormElement;
const taskTitleInput = document.getElementById('task-title') as HTMLInputElement;
const taskDescriptionInput = document.getElementById('task-description') as HTMLInputElement;
const taskList = document.getElementById('task-list') as HTMLUListElement;
const taskPrioritySelect = document.getElementById('task-priority') as HTMLSelectElement;

let tasks: Task[] = [];

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
        li.classList.add('task-item');

        //checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
        updateTaskStatus(task.id!, checkbox.checked);
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
        if (task.priority === optionVal) option.selected = true;
        prioritySelect.appendChild(option);
      });
      detailsDiv.appendChild(prioritySelect);
    } else {
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
        const titleInput = document.getElementById('edit-title-' + task.id) as HTMLInputElement;
        const descriptionInput = document.getElementById('edit-description-' + task.id) as HTMLInputElement;
        const prioritySelect = document.getElementById('edit-priority-' + task.id) as HTMLSelectElement;
        // update task object
        const updatedTask = {
          ...task,
          title: titleInput.value,
          description: descriptionInput.value,
          priority: prioritySelect.value,
          editing: false // exit editing mode
        };
        updateTask(updatedTask);
      }
      else{
        // enter editing mode
        task.editing = true;
        renderTasks(tasks);
      }
    });

    //delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      deleteTask(task.id!);
    });

    li.appendChild(checkbox);
    li.appendChild(detailsDiv);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

function populateFormForEdit(task: Task) {
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
function handleAddTask(event: Event) {
  event.preventDefault();
  const newTask: Task = {
    title: taskTitleInput.value,
    description: taskDescriptionInput.value,
    completed: false,
    priority: taskPrioritySelect.value
  };
  addTask(newTask);
  taskForm.reset();
}
//taskForm.addEventListener('submit', handleAddTask);

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

async function deleteTask(id: number) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Error deleting task');
      }
      await loadTasks();
    } catch (error) {
      console.error(error);
    }
}

async function updateTask(task: Task) {
  try {
    const response = await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) {
      throw new Error('Ошибка при обновлении задачи');
    }
    await loadTasks();
  } catch (error) {
    console.error(error);
  }
}

async function updateTaskStatus(id: number, completed: boolean) {
    try {
      const updatedTask = { completed };
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (!response.ok) {
        throw new Error('Error updating task status');
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
      completed: false,
      priority: taskPrioritySelect.value
    };
    addTask(newTask);
    taskForm.reset();
  });

  loadTasks();