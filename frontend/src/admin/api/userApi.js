// API fetch danh sách user cho admin
export async function fetchUserList() {
  const res = await fetch('http://127.0.0.1:8000/user/list');
  if (!res.ok) throw new Error('Lỗi khi lấy danh sách user');
  return await res.json();
}
