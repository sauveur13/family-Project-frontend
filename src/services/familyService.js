import api from './api';

export function tree(params = {}) {
  return api.get('/family/tree', { params }).then((res) => res.data);
}

export function ancestors(personId, depth) {
  return api
    .get(`/family/ancestors/${personId}`, { params: depth ? { depth } : {} })
    .then((res) => res.data.data);
}

export function descendants(personId, depth) {
  return api
    .get(`/family/descendants/${personId}`, { params: depth ? { depth } : {} })
    .then((res) => res.data.data);
}

export function generations() {
  return api.get('/family/generations').then((res) => res.data.data);
}
