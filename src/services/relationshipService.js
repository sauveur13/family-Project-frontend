import api from './api';

export function list(params = {}) {
  return api.get('/relationships', { params }).then((res) => res.data);
}

export function create(payload) {
  return api.post('/relationships', payload).then((res) => res.data.data);
}

export function update(id, payload) {
  return api.put(`/relationships/${id}`, payload).then((res) => res.data.data);
}

export function remove(id) {
  return api.delete(`/relationships/${id}`);
}
