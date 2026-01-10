import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>

        <h2>Добавление поста</h2>

        <div id="upload-image-container"></div>

        <textarea
          id="description-input"
          placeholder="Введите описание поста"
          required
        ></textarea>

        <button class="button" id="add-button">Опубликовать</button>
      </div>
    `;

    renderHeaderComponent({
      element: appEl.querySelector(".header-container"),
    });

    renderUploadImageComponent({
      element: document.getElementById("upload-image-container"),
      onImageUrlChange(newUrl) {
        imageUrl = newUrl;
      },
    });

    const addButton = document.getElementById("add-button");
    addButton.addEventListener("click", () => {
      const descriptionEl = document.getElementById("description-input");
      const description = descriptionEl.value?.trim();

      if (!description || !imageUrl) {
        alert("Заполните все поля и загрузите изображение");
        return;
      }

      onAddPostClick({ description, imageUrl });
    });
  };

  render();
}