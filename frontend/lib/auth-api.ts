// Client-side API helpers for signup and login

export async function signupUser(userData: {
  name: string;
  email: string;
  gstin: string;
  password: string;
  role: 'user' | 'admin';
}) {
  const res = await fetch('http://localhost:4000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Signup failed');
  }

  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Login failed');
  }

  return res.json();
}
