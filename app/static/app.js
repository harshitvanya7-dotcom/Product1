const API_BASE = "/api/tasks";

const $ = (id) => document.getElementById(id);

const taskForm = $("task-form");
const titleInput = $("title");
const descInput = $("description");
const taskList = $("task-list");

const allBtn = $("all-btn");
const pendingBtn = $("pending-btn");
const doneBtn = $("done-btn");

let tasks = [];
let filter = "all";

async function fetchTasks(){
  try {
    const res = await fetch(API_BASE + "/");
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    console.error("Fetch tasks failed", err);
  }
}

function renderTasks(){
  taskList.innerHTML = "";
  const shown = tasks.filter(t => {
    if(filter === "all") return true;
    if(filter === "pending") return t.status === "pending";
    if(filter === "done") return t.status === "done";
  });

  if(shown.length === 0){
    taskList.innerHTML = "<li style='color:#666;padding:8px'>No tasks yet.</li>";
    return;
  }

  for(const t of shown){
    const li = document.createElement("li");
    li.className = "task";

    const left = document.createElement("div");
    left.className = "left";

    const title = document.createElement("div");
    title.innerHTML = `<div class="title">${escapeHtml(t.title)}</div>
                       <div class="desc">${escapeHtml(t.description || "")}</div>`;

    const badge = document.createElement("span");
    badge.className = "status-badge " + (t.status === "done" ? "status-done" : "status-pending");
    badge.textContent = t.status;

    left.appendChild(badge);
    left.appendChild(title);

    const right = document.createElement("div");

    const doneBtn = document.createElement("button");
    doneBtn.className = "btn-done";
    doneBtn.textContent = t.status === "done" ? "Mark Pending" : "Mark Done";
    doneBtn.onclick = () => toggleStatus(t.id);

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editTaskPrompt(t);

    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteTask(t.id);

    right.appendChild(doneBtn);
    right.appendChild(editBtn);
    right.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(right);
    taskList.appendChild(li);
  }
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; });
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  if(!title) return alert("Title required");

  try {
    const res = await fetch(API_BASE + "/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ title, description })
    });
    if(res.ok){
      titleInput.value = "";
      descInput.value = "";
      await fetchTasks();
    } else {
      const err = await res.json();
      alert(err.error || "Could not create");
    }
  } catch (err) {
    console.error(err);
    alert("Request failed");
  }
});

async function toggleStatus(id){
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  const newStatus = t.status === "done" ? "pending" : "done";
  await updateTask(id, { status: newStatus });
}

async function updateTask(id, patch){
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(patch)
    });
    if(res.ok){
      await fetchTasks();
    } else {
      const err = await res.json();
      alert(err.error || "Could not update");
    }
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
}

function editTaskPrompt(task){
  const newTitle = prompt("Edit title:", task.title);
  if(newTitle === null) return; // canceled
  const newDesc = prompt("Edit description:", task.description || "");
  updateTask(task.id, { title: newTitle, description: newDesc || "" });
}

async function deleteTask(id){
  if(!confirm("Delete task?")) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if(res.ok) await fetchTasks();
    else {
      const err = await res.json();
      alert(err.error || "Delete failed");
    }
  } catch (err) {
    console.error(err);
    alert("Delete request failed");
  }
}

allBtn.onclick = () => { filter = "all"; setActive(allBtn); renderTasks(); };
pendingBtn.onclick = () => { filter = "pending"; setActive(pendingBtn); renderTasks(); };
doneBtn.onclick = () => { filter = "done"; setActive(doneBtn); renderTasks(); };

function setActive(btn){
  [allBtn, pendingBtn, doneBtn].forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

// initial load
fetchTasks();
