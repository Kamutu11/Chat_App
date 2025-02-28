import jwt_decode from 'jwt-decode';

export function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    jwt_decode(token);
    return true;
  } catch (e) {
    console.error('Token decoding failed:', e);
    return false;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwt_decode(token);
  } catch (e) {
    console.error('Token decoding failed:', e);
    return null;
  }
}
