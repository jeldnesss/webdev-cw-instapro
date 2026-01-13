import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, allPosts, goToPage, user, getToken } from "../index.js";
import { likePost, dislikePost } from "../api.js";

const escapeHtml = (text) => {
  if (!text) return "";

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function renderPostsPageComponent({ appEl }) {
  const postsHtml = posts
    .map(
      (post) => `
        <li class="post" data-post-id="${post.id}">
          <div class="post-header" data-user-id="${post.user.id}">
            <img
              src="${post.user.imageUrl}"
              class="post-header__user-image"
              alt="Аватар пользователя"
            >
            <p class="post-header__user-name">
              ${escapeHtml(post.user.name)}
            </p>
          </div>

          <div class="post-image-container">
            <img
              class="post-image"
              src="${post.imageUrl}"
              alt="Изображение поста"
            >
          </div>

          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img
                src="./assets/images/${
                  post.isLiked ? "like-active" : "like-not-active"
                }.svg"
                alt="Лайк"
              >
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
            </p>
          </div>

          <p class="post-text">
            <span class="user-name">
              ${escapeHtml(post.user.name)}
            </span>
            ${escapeHtml(post.description)}
          </p>

          <p class="post-date">
            ${formatDate(post.createdAt)}
          </p>
        </li>
      `
    )
    .join("");

  appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">${postsHtml}</ul>
    </div>
  `;

  renderHeaderComponent({
    element: appEl.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, { userId: userEl.dataset.userId });
    });
  }

  for (let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();

      if (!user) {
        alert("Авторизуйтесь, чтобы ставить лайки");
        return;
      }

      const postId = likeButton.dataset.postId;
      const post = posts.find((p) => String(p.id) === String(postId));
      if (!post) return;

      const action = post.isLiked ? dislikePost : likePost;

      action({ postId, token: getToken() })
        .then((data) => {
          const updatedPost = data.post ?? data;

          const postIndex = posts.findIndex(
            (p) => String(p.id) === String(updatedPost.id)
          );
          if (postIndex !== -1) {
            posts[postIndex] = updatedPost;
          }

          const allPostIndex = allPosts.findIndex(
            (p) => String(p.id) === String(updatedPost.id)
          );
          if (allPostIndex !== -1) {
            allPosts[allPostIndex] = updatedPost;
          }

          updatePostLikeInDom(updatedPost);
        })
        .catch((error) => {
          alert("Ошибка лайка: " + error.message);
        });
    });
  }
}

function updatePostLikeInDom(updatedPost) {
  const postEl = document.querySelector(
    `.post[data-post-id="${updatedPost.id}"]`
  );

  if (!postEl) return;

  const likeImg = postEl.querySelector(".like-button img");
  likeImg.src = `./assets/images/${
    updatedPost.isLiked ? "like-active" : "like-not-active"
  }.svg`;

  const likesCount = postEl.querySelector(".post-likes-text strong");
  likesCount.textContent = updatedPost.likes.length;
}
