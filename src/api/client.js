const jsonHeaders = { 'Content-Type': 'application/json' };

export async function getMe() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(body) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Mobile number does not exist");
    if (res.status === 401) throw new Error("Incorrect password");
    throw new Error((await res.text()) || 'Login failed');
  }
  return res.json();
}

export async function register(body) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 409) throw new Error("Mobile number already registered");
    throw new Error((await res.text()) || 'Registration failed');
  }
  return res.json();
}

export async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function fetchComplaints() {
  const res = await fetch(`/api/complaints?_t=${Date.now()}`, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createComplaint(body) {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteComplaint(id) {
  const res = await fetch(`/api/complaints/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/complaints/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateLiveLocation(location) {
  const formData = new FormData();
  formData.append('location', location);
  const res = await fetch('/api/complaints/live-location', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function updateUserLocation(location) {
  const res = await fetch('/api/auth/location', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchComplaint(id, patch) {
  const res = await fetch(`/api/complaints/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`/api/users?_t=${Date.now()}`, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createUser(body) {
  const res = await fetch('/api/users', {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchUserRole(userId, role) {
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}/role`, {
    method: 'PATCH',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteUser(userId) {
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchChatMessages(complaintId) {
  const res = await fetch(`/api/chats/${encodeURIComponent(complaintId)}/messages`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendChatMessage(complaintId, content) {
  const res = await fetch(`/api/chats/${encodeURIComponent(complaintId)}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchStats() {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProfile(body) {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to update profile');
  return res.json();
}

export async function changePassword(body) {
  const res = await fetch('/api/auth/password', {
    method: 'PUT',
    credentials: 'include',
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to change password');
  return res.json();
}

export async function uploadProfilePic(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/auth/profile-pic', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to upload profile picture');
  return res.json();
}

export async function sendVoiceMessage(complaintId, audioBlob) {
  const formData = new FormData();
  formData.append('voice', audioBlob, 'voice.webm');
  const res = await fetch(`/api/chats/${encodeURIComponent(complaintId)}/voice`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error((await res.text()) || 'Failed to send voice message');
  return res.json();
}
