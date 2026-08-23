import api from './api';

export function register(payload) {
  return api.post('/auth/register', payload).then((res) => res.data.data);
}

export function login(email, password) {
  return api.post('/auth/login', { email, password }).then((res) => res.data.data);
}

export function getMe() {
  return api.get('/auth/me').then((res) => res.data.data);
}

export function changePassword(currentPassword, newPassword) {
  return api.put('/auth/change-password', { currentPassword, newPassword });
}
