// ─────────────────────────────────────────
// app.js - Lógica de TaskFlow
// ─────────────────────────────────────────

const taskInput          = document.getElementById('task-input');
const btnAdd             = document.getElementById('btn-add');
const taskList           = document.getElementById('task-list');
const searchInput        = document.getElementById('search-input');
const themeToggle        = document.getElementById('theme-toggle');
const themeIcon          = document.getElementById('theme-icon');
const categorySelect     = document.getElementById('category-select');
const sectionTitle       = document.getElementById('section-title');
const navBtns            = document.querySelectorAll('.nav-btn');
const btnCompleteAll     = document.getElementById('btn-complete-all');
const btnUncompleteAll   = document.getElementById('btn-uncomplete-all');
const btnDeleteCompleted = document.getElementById('btn-delete-completed');

let activeCategory = 'todas';

// ─────────────────────────────────────────
// MODO OSCURO / CLARO
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
updateCounts();

// ─────────────────────────────────────────
// FILTRO POR CATEGORÍA
// ─────────────────────────────────────────
navBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    navBtns.forEach(b => {
      b.classList.remove('bg-accent', 'text-black', 'font-medium');
      b.classList.add('text-neutral-500', 'dark:text-neutral-400');
    });

    this.classList.add('bg-accent', 'text-black', 'font-medium');
    this.classList.remove('text-neutral-500', 'dark:text-neutral-400');

    activeCategory = this.dataset.category;
    const label = this.querySelector('span').textContent.trim();
    sectionTitle.textContent = activeCategory === 'todas' ? '📋 Todas las tareas' : label;

    renderTasks();
  });
});

// ─────────────────────────────────────────
// COMPLETAR TODAS LAS TAREAS
// ─────────────────────────────────────────
btnCompleteAll.addEventListener('click', function () {
  tasks = tasks.map(t => {
    if (activeCategory === 'todas' || t.category === activeCategory) {
      return { ...t, done: true };
    }
    return t;
  });
  saveTasks();
  renderTasks();
  updateCounts();
});

// ─────────────────────────────────────────
// DESMARCAR TODAS LAS TAREAS
// Vuelve a poner como pendientes todas las
// tareas completadas de la categoría activa.
// ─────────────────────────────────────────
btnUncompleteAll.addEventListener('click', function () {
  tasks = tasks.map(t => {
    if (activeCategory === 'todas' || t.category === activeCategory) {
      return { ...t, done: false };
    }
    return t;
  });
  saveTasks();
  renderTasks();
  updateCounts();
});

// ─────────────────────────────────────────
// BORRAR TAREAS COMPLETADAS
// Elimina solo las tareas que están marcadas
// como done en la categoría activa.
// ─────────────────────────────────────────
btnDeleteCompleted.addEventListener('click', function () {
  tasks = tasks.filter(t => {
    if (activeCategory === 'todas' || t.category === activeCategory) {
      return !t.done;
    }
    return true;
  });
  saveTasks();
  renderTasks();
  updateCounts();
});

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

  tasks.push({
    id:       Date.now(),
    text:     text,
    done:     false,
    category: categorySelect.value
  });

  saveTasks();
  renderTasks();
  updateCounts();
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
  updateCounts();
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
// ACTUALIZAR CONTADORES del aside
// ─────────────────────────────────────────
function updateCounts() {
  navBtns.forEach(btn => {
    const cat = btn.dataset.category;
    const count = cat === 'todas'
      ? tasks.length
      : tasks.filter(t => t.category === cat).length;

    const badge = btn.querySelector('.cat-count');
    if (badge) badge.textContent = count > 0 ? count : '';
  });
}

// ─────────────────────────────────────────
// PINTAR LAS TAREAS EN PANTALLA
// ─────────────────────────────────────────
function renderTasks() {
  taskList.innerHTML = '';

  const filtered = activeCategory === 'todas'
    ? tasks
    : tasks.filter(t => t.category === activeCategory);

  if (filtered.length === 0) {
    taskList.innerHTML = '<p class="text-neutral-400 text-sm py-4">No hay tareas aquí todavía. ¡Añade una! 👆</p>';
    return;
  }

  filtered.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card flex items-center gap-3 bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 mb-2 cursor-pointer hover:bg-neutral-200 dark:hover:bg-[#222] hover:translate-x-1 transition-all duration-200' + (task.done ? ' opacity-50' : '');

    card.innerHTML = `
      <div class="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${task.done ? 'bg-accent border-accent' : 'border-neutral-300 dark:border-neutral-600'}"></div>
      <span class="flex-1 text-sm ${task.done ? 'line-through text-neutral-400' : ''}">${task.text}</span>
      <span class="text-xs text-neutral-400 bg-neutral-200 dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full hidden md:block">${task.category}</span>
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
// FILTRO DE BÚSQUEDA
// ─────────────────────────────────────────
searchInput.addEventListener('input', filterTasks);

function filterTasks() {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('.task-card').forEach(card => {
    const title = card.querySelector('span').textContent.toLowerCase();
    card.style.display = title.includes(query) ? '' : 'none';
  });
}

// Estilo inicial del botón "Todas"
document.querySelector('[data-category="todas"]').classList.add('bg-accent', 'text-black', 'font-medium');
