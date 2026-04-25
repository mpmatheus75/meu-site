const STORAGE_KEY = 'mini-planner-tasks:v1';
const taskListEl = document.getElementById('task-list');
const addBtn = document.getElementById('add-task-btn');
const formEl = document.getElementById('task-form');
const saveBtn = document.getElementById('save-task');
const cancelBtn = document.getElementById('cancel-task');
const titleInput = document.getElementById('task-title');
const dateInput = document.getElementById('task-date');
const priorityInput = document.getElementById('task-priority');
const navBtns = document.querySelectorAll('.nav-btn');
const viewTitle = document.getElementById('view-title');

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentView = 'today';

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDateISO(d) {
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().slice(0, 10);
}

function getTodayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function showError(msg) {
  let err = document.getElementById('title-error');
  if (!err) {
    err = document.createElement('small');
    err.id = 'title-error';
    err.style.cssText = 'color:#b91c1c;font-size:12px;margin-top:4px;display:block';
    titleInput.parentNode.insertBefore(err, titleInput.nextSibling);
  }
  err.textContent = msg;
  setTimeout(() => { err.textContent = ''; }, 3000);
}

function filterTasks(list) {
  const todayISO = getTodayISO();

  if (currentView === 'today') {
    return list.filter(t => t.date === todayISO);
  }

  if (currentView === 'week') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    return list.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d >= now && d <= weekEnd;
    });
  }

  if (currentView === 'month') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return list.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  // 'all' — retorna tudo
  return list;
}

function render() {
  taskListEl.innerHTML = '';

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sorted = tasks.slice().sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const filtered = filterTasks(sorted);

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma tarefa para este período.';
    li.style.color = '#6b7280';
    li.style.fontSize = '14px';
    li.style.padding = '12px 0';
    taskListEl.appendChild(li);
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const left = document.createElement('div');
    left.className = 'task-left';

    const cb = document.createElement('div');
    cb.className = task.done ? 'checkbox done' : 'checkbox';
    cb.textContent = task.done ? '✓' : '';
    cb.onclick = () => {
      task.done = !task.done;
      saveStore();
      render();
    };

    const info = document.createElement('div');

    const title = document.createElement('div');
    title.className = task.done ? 'task-title done' : 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('div');
    meta.className = 'meta';
    const priorityLabel = { high: 'Alta', medium: 'Média', low: 'Baixa' };
    meta.textContent = `${task.date || 'Sem data'} • ${priorityLabel[task.priority] || task.priority}`;

    info.appendChild(title);
    info.appendChild(meta);
    left.appendChild(cb);
    left.appendChild(info);

    const actions = document.createElement('div');
    const del = document.createElement('button');
    del.className = 'btn-small btn-danger';
    del.textContent = 'Excluir';
    del.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveStore();
      render();
    };
    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    taskListEl.appendChild(li);
  });
}

addBtn.addEventListener('click', () => {
  formEl.classList.toggle('hidden');
  if (!formEl.classList.contains('hidden')) titleInput.focus();
});

saveBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  if (!title) {
    showError('Escreva um título para a tarefa.');
    titleInput.focus();
    return;
  }

  const date = dateInput.value || getTodayISO();
  const priority = priorityInput.value;

  const newTask = { id: Date.now().toString(), title, date, priority, done: false };
  tasks.push(newTask);
  saveStore();

  titleInput.value = '';
  dateInput.value = '';
  priorityInput.value = 'low';
  formEl.classList.add('hidden');
  render();
});

titleInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveBtn.click();
  if (e.key === 'Escape') cancelBtn.click();
});

cancelBtn.addEventListener('click', () => {
  formEl.classList.add('hidden');
  titleInput.value = '';
  dateInput.value = '';
});

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    viewTitle.textContent = btn.textContent;
    render();
  });
});

render();