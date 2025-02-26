import { Task } from "./Task";
import { Priority } from "./Priority";
import { TaskManager } from "./TaskManager";

const taskForm = document.getElementById('task-form') as HTMLFormElement;
const taskTitleInput = document.getElementById('task-title') as HTMLInputElement;
const taskDescriptionInput = document.getElementById('task-description') as HTMLInputElement;
const taskPrioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
const activeTaskList = document.getElementById('active-task-list') as HTMLUListElement;
const completedTaskList = document.getElementById('completed-task-list') as HTMLUListElement;
const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;
const filterSelect = document.getElementById('filter-select') as HTMLSelectElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

const taskManager = new TaskManager();

sortSelect.addEventListener('change', applySortAndFilter);
filterSelect.addEventListener('change', applySortAndFilter);

searchInput.addEventListener('input', () => {
  applySortAndFilter();
})

//render tasks
function renderTasks(tasks: Task[]): void {
  activeTaskList.innerHTML = '';
  completedTaskList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.classList.add('task-item');

    // checkbox for task status
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      updateTaskStatus(task.id!, checkbox.checked);
    });
    li.appendChild(checkbox);

    // task details (title, description, priority)
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'task-details';
    detailsDiv.style.display = 'inline-block';

    if (task.editing) {
      // edit mode
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
      // priority options
      [Priority.Low, Priority.Medium, Priority.High].forEach(optionVal => {
        const option = document.createElement('option');
        option.value = optionVal;
        option.textContent = optionVal;
        if (task.priority === optionVal) {
          option.selected = true;
        }
        prioritySelect.appendChild(option);
      });
      detailsDiv.appendChild(prioritySelect);
    } else {
      // view mode
      const detailsSpan = document.createElement('span');
      detailsSpan.textContent = `${task.title} - ${task.description || ''} [Priority: ${task.priority}]`;
      detailsDiv.appendChild(detailsSpan);
    }
    li.appendChild(detailsDiv);

    // priority styling
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

    // edit button (pencil icon)
    const editButton = document.createElement('button');
    editButton.innerHTML = '✏️';
    editButton.style.opacity = task.editing ? '0.5' : '1';
    editButton.addEventListener('click', () => {
      if (task.editing) {
        const titleInput = document.getElementById('edit-title-' + task.id) as HTMLInputElement;
        const descriptionInput = document.getElementById('edit-description-' + task.id) as HTMLInputElement;
        const prioritySelect = document.getElementById('edit-priority-' + task.id) as HTMLSelectElement;
        const updatedTask: Task = {
          ...task,
          title: titleInput.value,
          description: descriptionInput.value,
          priority: prioritySelect.value as Priority,
          editing: false,
          createdAt: task.createdAt
        };
        updateTask(updatedTask);
      } else {
        // enable edit mode
        task.editing = true;
        renderTasks(taskManager.getTasks());
      }
    });
    li.appendChild(editButton);

    // delete button (cross icon)
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '✖️';
    deleteButton.addEventListener('click', () => {
      deleteTask(task.id!);
    });
    li.appendChild(deleteButton);

    // if task is new, add rise animation
    const animationClass = taskManager.getAnimationForTask(task.id!);
    if (animationClass) {
      li.classList.add(animationClass);
      taskManager.deleteAnimationForTask(task.id!);
    }

    // add task to appropriate list
    if (task.completed) {
      // if task is completed, add fall animation
      if (!li.classList.contains('fall-animation') && !li.classList.contains('rise-animation')) {
        li.classList.add('fall-animation');
      }
      completedTaskList.appendChild(li);
    } else {
      activeTaskList.appendChild(li);
    }
  });
}

// sort and filter tasks
function applySortAndFilter(): void {
  let filteredTasks = [...taskManager.getTasks()];

  // status filter
  const filterValue = filterSelect.value;
  if (filterValue === 'active') {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  } else if (filterValue === 'completed') {
    filteredTasks = filteredTasks.filter(task => task.completed);
  }

  // search query filter
  const query = searchInput.value.trim().toLowerCase();
  if (query !== '') {
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  }

  // sort
  const sortValue = sortSelect.value;
  if (sortValue === 'priority-asc') {
    filteredTasks.sort((a, b) => taskManager.getPriorityValue(a.priority) - taskManager.getPriorityValue(b.priority));
  } else if (sortValue === 'priority-desc') {
    filteredTasks.sort((a, b) => taskManager.getPriorityValue(b.priority) - taskManager.getPriorityValue(a.priority));
  } else if (sortValue === 'date-asc') {
    filteredTasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortValue === 'date-desc') {
    filteredTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  renderTasks(filteredTasks);
}


// new task form submission
taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const newTask: Partial<Task> = {
    title: taskTitleInput.value,
    description: taskDescriptionInput.value,
    completed: false,
    priority: taskPrioritySelect.value as Priority
  };
  taskManager.addTask(newTask as Task).then(() => {
    applySortAndFilter();
  });
  taskForm.reset();
});

// task update through PUT
function updateTask(task: Task): void {
  taskManager.updateTask(task).then(() => {
    applySortAndFilter();
  });
}

// task deletion through DELETE
function deleteTask(id: number): void {
  taskManager.deleteTask(id).then(() => {
    applySortAndFilter();
  });
}

// task status update through PATCH
function updateTaskStatus(id: number, completed: boolean): void {
  taskManager.updateTaskStatus(id, completed).then(() => {
    applySortAndFilter();
  });
}

// load tasks
taskManager.loadTasks().then(() => {
  applySortAndFilter();
});
