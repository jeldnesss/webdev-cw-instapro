const personalKey = "jeldnesss";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

const formatToken = (token) => (token ? `Bearer ${token}` : undefined);

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: formatToken(token),
    },
  })
    .then((res) => {
      if (res.status === 401) throw new Error("Нет авторизации");
      return res.json();
    })
    .then((data) => data.posts);
}

export function addPost({ description, imageUrl, token }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ description, imageUrl }),
  }).then(async (res) => {
    const data = await res.json();
    console.log("Ответ сервера:", data);
    if (!res.ok) {
      throw new Error(data?.message || "Ошибка добавления поста");
    }
    return data.post || data;
  });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(`${baseHost}/api/user`, {
    method: "POST",
    body: JSON.stringify({ login, password, name, imageUrl }),
  }).then((res) => {
    if (res.status === 400)
      throw new Error("Такой пользователь уже существует");
    return res.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(`${baseHost}/api/user/login`, {
    method: "POST",
    body: JSON.stringify({ login, password }),
  }).then((res) => {
    if (res.status === 400) throw new Error("Неверный логин или пароль");
    return res.json();
  });
}

export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(`${baseHost}/api/upload/image`, {
    method: "POST",
    body: data,
  }).then((res) => res.json());
}

export function likePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
}

export function dislikePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
}
