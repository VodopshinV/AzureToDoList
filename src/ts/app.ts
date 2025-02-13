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
const taskPrioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
const activeTaskList = document.getElementById('active-task-list') as HTMLUListElement;
const completedTaskList = document.getElementById('completed-task-list') as HTMLUListElement;

let tasks: Task[] = [];
let animationForTask: { [key: number]: string } = {};


async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if(!response.ok) {
            throw new Error('Error loading tasks');
        }
        tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error(error);
    }
}

function createTaskListItem(task: Task): HTMLLIElement {
  const li = document.createElement('li');
  li.classList.add('task-item');

  // create checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => {
    updateTaskStatus(task.id!, checkbox.checked);
  });
  li.appendChild(checkbox);

  // container for task details
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'task-details';
  detailsDiv.style.display = 'inline-block';

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
    // view mode: show task details
    const detailsSpan = document.createElement('span');
    detailsSpan.textContent = `${task.title} - ${task.description || ''} [Priority: ${task.priority}]`;
    detailsDiv.appendChild(detailsSpan);
  }
  li.appendChild(detailsDiv);

  // edit button
  const editButton = document.createElement('button');
  editButton.innerHTML = '✏️';
  editButton.style.opacity = task.editing ? '0.5' : '1';
  editButton.addEventListener('click', () => {
    if (task.editing) {
      // save changes
      const titleInput = document.getElementById('edit-title-' + task.id) as HTMLInputElement;
      const descriptionInput = document.getElementById('edit-description-' + task.id) as HTMLInputElement;
      const prioritySelect = document.getElementById('edit-priority-' + task.id) as HTMLSelectElement;
      const updatedTask: Task = {
        ...task,
        title: titleInput.value,
        description: descriptionInput.value,
        priority: prioritySelect.value,
        editing: false
      };
      updateTask(updatedTask);
    } else {
      // edit mode
      task.editing = true;
      renderTasks(tasks);
    }
  });
  li.appendChild(editButton);

  // delete button
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '✖️';
  deleteButton.addEventListener('click', () => {
    deleteTask(task.id!);
  });
  li.appendChild(deleteButton);

  switch (task.priority.toLowerCase()) {
    case 'low':
      detailsDiv.classList.add('priority-low');
      break;
    case 'medium':
      detailsDiv.classList.add('priority-medium');
      break;
    case 'high':
      detailsDiv.classList.add('priority-high');
      break;
    default:
      break;
  }

  if (animationForTask[task.id!]) {
    li.classList.add(animationForTask[task.id!]);
    delete animationForTask[task.id!]; // delete, so that the animation is not repeated
  }
  
  return li;
}

function renderTasks(tasks: Task[]) {
  activeTaskList.innerHTML = '';
  completedTaskList.innerHTML = '';

  // filter tasks
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  activeTasks.forEach(task => {
    const li = createTaskListItem(task);
    activeTaskList.appendChild(li);
  });

  completedTasks.forEach(task => {
    const li = createTaskListItem(task);
    // add animation class
    if (!li.classList.contains('fall-animation') && !li.classList.contains('rise-animation')) {
      li.classList.add('fall-animation');
    }
    completedTaskList.appendChild(li);
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
      animationForTask[id] = completed ? "fall-animation" : "rise-animation";
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