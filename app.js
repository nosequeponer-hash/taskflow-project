// ─────────────────────────────────────────
// app.js - Lógica de TaskFlow
// ─────────────────────────────────────────

// Seleccionamos los elementos del HTML
const taskInput   = document.getElementById('task-input');
const btnAdd      = document.getElementById('btn-add');
const taskList    = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');

// ─────────────────────────────────────────
// MODO OSCURO / CLARO
// Al pulsar el botón, añadimos o quitamos
// la clase "dark" del elemento <html>.
// Tailwind activa los estilos "dark:..."
// cuando esa clase está presente.
// ─────────────────────────────────────────
themeToggle.addEventListener('click', function() {
  const html = document.documentElement;
  html.classList.toggle('dark');

  // Cambiamos el icono según el modo activo
  if (html.classList.contains('dark')) {
    themeIcon.textContent = '☀️';
  } else {
    themeIcon.textContent = '🌙';
  }
});

// ─────────────────────────────────────────
// CARGAR TAREAS GUARDADAS en LocalStorage
// ─────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('taskflow-tasks')) || [];

renderTasks();

// ─────────────────────────────────────────
// AÑADIR TAREA
// ─────────────────────────────────────────
btnAdd.addEventListener('click', addTask);

taskInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id:   Date.now(),
    text: text,
    done: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

// ─────────────────────────────────────────
// BORRAR TAREA
// ─────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// ─────────────────────────────────────────
// MARCAR COMO COMPLETADA
// ─────────────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) return { ...task, done: !task.done };
    return task;
  });
  saveTasks();
  renderTasks();
}

// ─────────────────────────────────────────
// GUARDAR EN LOCALSTORAGE
// ─────────────────────────────────────────
function saveTasks() {
  localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
}

// ─────────────────────────────────────────
// PINTAR LAS TAREAS EN PANTALLA
// Las tarjetas ahora usan clases de Tailwind
// en lugar de CSS personalizado.
// ─────────────────────────────────────────
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="text-neutral-400 text-sm py-4">No hay tareas todavía. ¡Añade una! 👆</p>';
    return;
  }

  tasks.forEach(task => {
    const card = document.createElement('div');

    // Clases Tailwind para la tarjeta
    card.className = [
      'flex items-center gap-3',
      'bg-neutral-100 dark:bg-neutral-900',
      'border border-neutral-200 dark:border-neutral-800',
      'rounded-xl px-4 py-3 mb-2 cursor-pointer',
      'hover:bg-neutral-200 dark:hover:bg-neutral-800',
      'hover:translate-x-1',
      'transition-all duration-200',
      task.done ? 'opacity-50' : ''
    ].join(' ');

    card.innerHTML = `
      <div class="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-300
        ${task.done
          ? 'bg-accent border-accent'
          : 'border-neutral-300 dark:border-neutral-600'
        }">
      </div>
      <span class="flex-1 text-sm ${task.done ? 'line-through text-neutral-400' : ''}">${task.text}</span>
      <button
        class="text-neutral-400 hover:text-danger hover:bg-danger/10 text-sm px-2 py-1 rounded-lg flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-danger/30 transition-all duration-200"
        title="Eliminar tarea"
      >✕</button>
    `;

    card.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      toggleTask(task.id);
    });

    card.querySelector('button').addEventListener('click', function() {
      deleteTask(task.id);
    });

    taskList.appendChild(card);
  });

  filterTasks();
}

// ─────────────────────────────────────────
// FILTRO DE BÚSQUEDA (Bonus)
// ─────────────────────────────────────────
searchInput.addEventListener('input', filterTasks);

function filterTasks() {
  const query = searchInput.value.toLowerCase();
  const cards = taskList.querySelectorAll('[class*="flex items-center"]');

  cards.forEach(card => {
    const title = card.querySelector('span').textContent.toLowerCase();
    card.style.display = title.includes(query) ? '' : 'none';
  });
}
