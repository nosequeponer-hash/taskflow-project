// ─────────────────────────────────────────
// app.js - Lógica de TaskFlow
// ─────────────────────────────────────────

const taskInput      = document.getElementById('task-input');
const btnAdd         = document.getElementById('btn-add');
const taskList       = document.getElementById('task-list');
const searchInput    = document.getElementById('search-input');
const themeToggle    = document.getElementById('theme-toggle');
const themeIcon      = document.getElementById('theme-icon');
const categorySelect = document.getElementById('category-select');
const sectionTitle   = document.getElementById('section-title');
const navBtns        = document.querySelectorAll('.nav-btn');

// Categoría activa por defecto: todas
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
// Al hacer clic en un botón del aside,
// guardamos la categoría activa y
// volvemos a pintar las tareas filtradas.
// ─────────────────────────────────────────
navBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    // Quitamos el estilo activo a todos
    navBtns.forEach(b => {
      b.classList.remove('active-cat', 'bg-accent', 'text-black', 'font-medium');
      b.classList.add('text-neutral-500', 'dark:text-neutral-400');
    });

    // Añadimos el estilo activo al pulsado
    this.classList.add('active-cat', 'bg-accent', 'text-black', 'font-medium');
    this.classList.remove('text-neutral-500', 'dark:text-neutral-400');

    // Guardamos la categoría activa
    activeCategory = this.dataset.category;

    // Actualizamos el título de la sección
    const label = this.textContent.replace(/\d+/g, '').trim();
    sectionTitle.textContent = activeCategory === 'todas' ? '📋 Todas las tareas' : label;

    renderTasks();
  });
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

  // Guardamos también la categoría seleccionada
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
// Muestra cuántas tareas hay en cada categoría
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
// Filtra por categoría activa antes de pintar
// ─────────────────────────────────────────
function renderTasks() {
  taskList.innerHTML = '';

  // Filtramos según la categoría activa
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
      <span class="text-xs text-neutral-400 bg-neutral-200 dark:bg-[#2a2a2a] px-2 py-0.5 rounded-full">${task.category}</span>
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

// Aplicamos estilos iniciales al botón "Todas" que está activo por defecto
document.querySelector('[data-category="todas"]').classList.add('bg-accent', 'text-black', 'font-medium');
