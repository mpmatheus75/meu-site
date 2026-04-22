// Simple planner with localStorage
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

function saveStore(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

function formatDateISO(d){
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().slice(0,10);
}

function render(){
  taskListEl.innerHTML = '';
  const todayISO = formatDateISO(new Date());
  let filtered = tasks.slice().sort((a,b)=> a.date.localeCompare(b.date) || b.priority.localeCompare(a.priority));

  if(currentView === 'today'){
    filtered = filtered.filter(t=> t.date === todayISO);
  } else if(currentView === 'week'){
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate()+7);
    filtered = filtered.filter(t=>{
      const d = new Date(t.date);
      return d >= now && d <= weekEnd;
    });
  } // month/all can be expanded

  if(filtered.length === 0){
    const li = document.createElement('li');
    li.textContent = 'Nenhuma tarefa';
    li.style.color = '#6b7280';
    taskListEl.appendChild(li);
    return;
  }

  filtered.forEach(task=>{
    const li = document.createElement('li');
    li.className = 'task-item';

    const left = document.createElement('div');
    left.className = 'task-left';

    const cb = document.createElement('div');
    cb.className = 'checkbox';
    cb.textContent = task.done ? '✓' : '';
    cb.style.background = task.done ? '#ecfdf5' : 'transparent';
    cb.onclick = ()=> { task.done = !task.done; saveStore(); render(); };

    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${task.date || 'Sem data'} • ${task.priority}`;

    info.appendChild(title);
    info.appendChild(meta);
    left.appendChild(cb);
    left.appendChild(info);

    const actions = document.createElement('div');
    const del = document.createElement('button');
    del.className = 'btn-small btn-danger';
    del.textContent = 'Excluir';
    del.onclick = ()=> { tasks = tasks.filter(t=> t.id !== task.id); saveStore(); render(); };

    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    taskListEl.appendChild(li);
  });
}

addBtn.addEventListener('click', ()=>{
  formEl.classList.toggle('hidden');
  titleInput.focus();
});

saveBtn.addEventListener('click', ()=>{
  const title = titleInput.value.trim();
  const date = dateInput.value || formatDateISO(new Date());
  const priority = priorityInput.value;

  if(!title){ alert('Escreva um título'); return; }

  const newTask = { id: Date.now().toString(), title, date, priority, done:false };
  tasks.push(newTask);
  saveStore();
  titleInput.value = '';
  dateInput.value = '';
  formEl.classList.add('hidden');
  render();
});

cancelBtn.addEventListener('click', ()=>{
  formEl.classList.add('hidden');
  titleInput.value = '';
  dateInput.value = '';
});

navBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    navBtns.forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    viewTitle.textContent = btn.textContent;
    render();
  });
});

// initial render
render();
