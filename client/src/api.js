// api.js
const API_URL = '/api/todos';

export async function getTodos() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function addTodo(todo) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo),
  });
  return res.json();
}

export async function updateTodo(id, updates) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteTodo(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE' });
  return res.json();
}
