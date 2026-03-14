// ─────────────────────────────────────────
// app.js - Lógica de TaskFlow
// ─────────────────────────────────────────

// Seleccionamos los elementos del HTML que vamos a necesitar
const taskInput  = document.getElementById('task-input');
const btnAdd     = document.getElementById('btn-add');
const taskList   = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');

// ─────────────────────────────────────────
// CARGAR TAREAS GUARDADAS
// Al abrir la app, leemos lo que haya en
// LocalStorage. Si no hay nada, usamos
// un array vacío [].
// ─────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('taskflow-tasks')) || [];

// Pintamos las tareas guardadas nada más cargar la página
renderTasks();

// ─────────────────────────────────────────
// AÑADIR TAREA
// Escuchamos el clic en el botón "+ Añadir"
// con addEventListener.
// ─────────────────────────────────────────
btnAdd.addEventListener('click', addTask);

// También permitimos añadir con la tecla Enter
taskInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  // Capturamos el texto del input y quitamos espacios sobrantes
  const text = taskInput.value.trim();

  // Si el input está vacío, no hacemos nada
  if (!text) return;

  // Creamos un objeto para la nueva tarea
  const newTask = {
    id:   Date.now(),   // usamos la fecha como ID único
    text: text,
    done: false
  };

  // La añadimos al array de tareas
  tasks.push(newTask);

  // Guardamos en LocalStorage
  saveTasks();

  // Actualizamos la pantalla
  renderTasks();

  // Limpiamos el input
  taskInput.value = '';
  taskInput.focus();
}

// ─────────────────────────────────────────
// BORRAR TAREA
// Esta función recibe el ID de la tarea
// y la elimina del array.
// ─────────────────────────────────────────
function deleteTask(id) {
  // Filtramos el array quitando la tarea con ese ID
  tasks = tasks.filter(task => task.id !== id);

  // Guardamos y actualizamos
  saveTasks();
  renderTasks();
}

// ─────────────────────────────────────────
// MARCAR COMO COMPLETADA
// Al hacer clic en la tarjeta, cambia
// entre hecha y pendiente.
// ─────────────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, done: !task.done };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

// ─────────────────────────────────────────
// GUARDAR EN LOCALSTORAGE
// Convertimos el array a texto con
// JSON.stringify y lo guardamos.
// ─────────────────────────────────────────
function saveTasks() {
  localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
}

// ─────────────────────────────────────────
// PINTAR LAS TAREAS EN PANTALLA
// Recorremos el array y creamos un elemento
// HTML por cada tarea.
// ─────────────────────────────────────────
function renderTasks() {
  // Vaciamos la lista antes de volver a pintarla
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="color: var(--color-muted); font-size: 0.9rem; padding: 1rem 0;">No hay tareas todavía. ¡Añade una! 👆</p>';
    return;
  }

  tasks.forEach(task => {
    // Creamos el div de la tarjeta
    const card = document.createElement('div');
    card.className = 'task-card' + (task.done ? ' done' : '');
    card.dataset.id = task.id;

    card.innerHTML = `
      <div class="task-check"></div>
      <span class="task-title">${task.text}</span>
      <button class="btn-delete" title="Eliminar tarea">✕</button>
    `;

    // Al hacer clic en la tarjeta la marcamos como hecha
    card.addEventListener('click', function(e) {
      // Evitamos que el clic en el botón de borrar también marque la tarea
      if (e.target.classList.contains('btn-delete')) return;
      toggleTask(task.id);
    });

    // Al hacer clic en el botón de borrar, eliminamos la tarea
    card.querySelector('.btn-delete').addEventListener('click', function() {
      deleteTask(task.id);
    });

    taskList.appendChild(card);
  });

  // Aplicamos el filtro de búsqueda si hay algo escrito
  filterTasks();
}

// ─────────────────────────────────────────
// FILTRO DE BÚSQUEDA (Bonus)
// Oculta las tarjetas que no coincidan
// con el texto del buscador.
// ─────────────────────────────────────────
searchInput.addEventListener('input', filterTasks);

function filterTasks() {
  const query = searchInput.value.toLowerCase();
  const cards = taskList.querySelectorAll('.task-card');

  cards.forEach(card => {
    const title = card.querySelector('.task-title').textContent.toLowerCase();
    if (title.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}
