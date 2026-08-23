import api from './api';

export function list(params = {}) {
  return api.get('/users', { params }).then((res) => res.data);
}

export function update(id, payload) {
  return api.put(`/users/${id}`, payload).then((res) => res.data.data);
}

export function suspend(id) {
  return api.delete(`/users/${id}`);
}
