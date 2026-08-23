import api from './api';

export function list(params = {}) {
  return api.get('/persons', { params }).then((res) => res.data);
}

export function get(id) {
  return api.get(`/persons/${id}`).then((res) => res.data.data);
}

export function relations(id) {
  return api.get(`/persons/${id}/relations`).then((res) => res.data.data);
}

export function create(payload) {
  return api.post('/persons', payload).then((res) => res.data.data);
}

export function update(id, payload) {
  return api.put(`/persons/${id}`, payload).then((res) => res.data.data);
}

export function deactivate(id) {
  return api.delete(`/persons/${id}`).then((res) => res.data);
}

export function removePermanent(id) {
  return api.delete(`/persons/${id}`, { params: { mode: 'permanent' } }).then((res) => res.data);
}

export function restore(id) {
  return api.put(`/persons/${id}/restore`).then((res) => res.data.data);
}

export function uploadPhoto(id, file) {
  const formData = new FormData();
  formData.append('photo', file);
  return api
    .post(`/persons/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data.data);
}

export function removePhoto(id) {
  return api.delete(`/persons/${id}/photo`);
}
