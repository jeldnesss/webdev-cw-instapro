import { getPosts, addPost } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";

import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";

import {
  getUserFromLocalStorage,
  saveUserToLocalStorage,
  removeUserFromLocalStorage,
} from "./helpers.js";

// текущий пользователь
export let user = getUserFromLocalStorage();
// текущая страница
export let page = null;

// все посты и отфильтрованные посты для отображения
export let allPosts = [];
export let posts = [];

// функция получения токена текущего пользователя
export const getToken = () => (user ? user.token : undefined);

// функция выхода пользователя
export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

// переход между страницами
export const goToPage = (newPage, data = {}) => {
  const allowedPages = [
    POSTS_PAGE,
    AUTH_PAGE,
    ADD_POSTS_PAGE,
    USER_POSTS_PAGE,
    LOADING_PAGE,
  ];
  if (!allowedPages.includes(newPage)) {
    throw new Error("Страницы не существует");
  }

  if (newPage === ADD_POSTS_PAGE) {
    page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
    return renderApp();
  }

  if (newPage === POSTS_PAGE) {
    page = LOADING_PAGE;
    renderApp();

    return getPosts({ token: getToken() })
      .then((newPosts) => {
        allPosts = newPosts;
        posts = newPosts;
        page = POSTS_PAGE;
        renderApp();
      })
      .catch((error) => {
        alert("Ошибка загрузки постов: " + error.message);
        page = POSTS_PAGE;
        renderApp();
      });
  }

  if (newPage === USER_POSTS_PAGE) {
    page = USER_POSTS_PAGE;
    posts = allPosts.filter((post) => post.user.id === data.userId);
    return renderApp();
  }

  page = newPage;
  renderApp();
};

// рендер приложения
const renderApp = () => {
  const appEl = document.getElementById("app");

  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({ appEl, user, goToPage });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      user,
      goToPage,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick: ({ description, imageUrl }) => {
        addPost({
          description,
          imageUrl,
          token: getToken(),
        })
          .then(() => goToPage(POSTS_PAGE))
          .catch((error) => alert("Ошибка добавления поста: " + error.message));
      },
    });
  }

  if (page === POSTS_PAGE || page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({ appEl });
  }
};

// старт приложения на странице постов
goToPage(POSTS_PAGE);
