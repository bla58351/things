import { Item, Location, Tag, MoveRecord } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '请求失败');
  }
  return res.json();
}

export const itemsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Item[]>(`/items${query}`);
  },

  getById: (id: string) => request<Item>(`/items/${id}`),

  create: (data: Partial<Item>) =>
    request<Item>('/items', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Item>) =>
    request<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/items/${id}`, { method: 'DELETE' }),

  move: (id: string, toLocationId: string, note?: string) =>
    request<{ item: Item; record: MoveRecord }>(`/items/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ toLocationId, note: note || '' }),
    }),

  history: (id: string) => request<MoveRecord[]>(`/items/${id}/history`),

  categories: () => request<string[]>('/items/categories'),

  // 批量操作
  batchUpdate: (ids: string[], data: Partial<Item>) =>
    request<{ updated: number }>('/items/batch', {
      method: 'PUT',
      body: JSON.stringify({ ids, data }),
    }),

  batchDelete: (ids: string[]) =>
    request<{ deleted: number }>('/items/batch', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
};

export const locationsApi = {
  list: () => request<Location[]>('/locations'),

  create: (data: { name: string; parentId?: string | null; description?: string }) =>
    request<Location>('/locations', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { name?: string; description?: string }) =>
    request<Location>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<{ message: string }>(`/locations/${id}`, { method: 'DELETE' }),
};

export const tagsApi = {
  list: () => request<Tag[]>('/tags'),

  create: (name: string) =>
    request<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name }) }),

  update: (id: string, name: string) =>
    request<Tag>(`/tags/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),

  delete: (id: string) =>
    request<{ message: string }>(`/tags/${id}`, { method: 'DELETE' }),
};

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export const categoriesApi = {
  list: () => request<Category[]>('/categories'),

  create: (name: string) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  update: (id: string, name: string) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }),
};