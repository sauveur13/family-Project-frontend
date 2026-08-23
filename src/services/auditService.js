import api from './api';

export function list(params = {}) {
  return api.get('/audit-logs', { params }).then((res) => res.data);
}
