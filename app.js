// ─────────────────────────────────────────
// app.js - Lógica de TaskFlow
// ─────────────────────────────────────────

const taskInput   = document.getElementById('task-input');
const btnAdd      = document.getElementById('btn-add');
const taskList    = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');

// ─────────────────────────────────────────
// MODO OSCURO / CLARO
// Añadimos o quitamos la clase "dark" del
// elemento <html>. Tailwind activa los
// estilos "dark:..." cuando esa clase existe.
// ─────────────────────────────────────────
themeToggle.addEventListener('click', function () {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  themeIcon.textContent = isDark ? '☀️' : '🌙';
});

// ─────────────────────────────────────────
// CARGAR TAREAS de LocalStorage
// ─────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('taskflow-tasks')) || [];
renderTasks();

// ─────────────────────────────────────────
// AÑADIR TAREA
// ─────────────────────────────────────────
btnAdd.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

// ─────────────────────────────────────────
// BORRAR TAREA
// ─────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// ─────────────────────────────────────────
// MARCAR COMO COMPLETADA
// ─────────────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
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
// ─────────────────────────────────────────
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="text-neutral-400 text-sm py-4">No hay tareas todavía. ¡Añade una! 👆</p>';
    return;
  }

  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card flex items-center gap-3 bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 mb-2 cursor-pointer hover:bg-neutral-200 dark:hover:bg-[#222] hover:translate-x-1 transition-all duration-200' + (task.done ? ' opacity-50' : '');

    card.innerHTML = `
      <div class="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${task.done ? 'bg-accent border-accent' : 'border-neutral-300 dark:border-neutral-600'}"></div>
      <span class="flex-1 text-sm ${task.done ? 'line-through text-neutral-400' : ''}">${task.text}</span>
      <button class="delete-btn text-neutral-400 hover:text-danger text-sm px-2 py-1 rounded-lg flex-shrink-0 transition-all duration-200">✕</button>
    `;

    card.addEventListener('click', function (e) {
      if (e.target.classList.contains('delete-btn')) return;
      toggleTask(task.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', function () {
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
  document.querySelectorAll('.task-card').forEach(card => {
    const title = card.querySelector('span').textContent.toLowerCase();
    card.style.display = title.includes(query) ? '' : 'none';
  });
}
