import api from './api';

export function admin() {
  return api.get('/dashboard/admin').then((res) => res.data.data);
}

export function user() {
  return api.get('/dashboard/user').then((res) => res.data.data);
}
