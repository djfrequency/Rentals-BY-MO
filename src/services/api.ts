import { Product } from '../types.ts';

const TOKEN_KEY = 'rentals_by_mo_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products');
  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) {
    throw new Error(`Failed to load categories: ${res.statusText}`);
  }
  return res.json();
}

export async function adminLogin(username: string, password: string): Promise<{ token: string; user: { username: string; role: string } }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  setAuthToken(data.token);
  return data;
}

export async function adminLogout(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearAuthToken();
}

export async function checkAdminSession(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      clearAuthToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<string> {
  const res = await fetch('/api/admin/change-password', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update password');
  }
  return data.message;
}

export async function uploadImageFile(file: File): Promise<string> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload image');
  }
  return data.url;
}

export async function addProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create product');
  }
  return data;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update product');
  }
  return data;
}

export async function toggleProductAvailability(id: string, isAvailable: boolean): Promise<Product> {
  const res = await fetch(`/api/products/${id}/availability`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isAvailable }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to change product availability');
  }
  return data.product;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete product');
  }
}

export async function resetCatalog(): Promise<Product[]> {
  const res = await fetch('/api/products/reset', {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset catalog');
  }
  return data.products;
}

export async function importCatalog(products: Product[]): Promise<Product[]> {
  const res = await fetch('/api/products/import', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ products }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to import catalog');
  }
  return data.products;
}
