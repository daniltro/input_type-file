import { Preloader } from "../preloader/preloader.js";
import { descriptions } from "./constants.js";

export class App {
  constructor(pageSelector, fileUploader, imagePreviewer) {
    this.page = document.querySelector(pageSelector);
    this.fileUploader = fileUploader;
    this.imagePreviewer = imagePreviewer;
    this.preloader = new Preloader();
    this.init();
  }

  init() {
    this.createLayout();
  }

  createLayout() {
    const main = document.createElement("main");
    main.className = "main";

    const appTitle = document.createElement("h1");
    appTitle.className = "app-title";
    appTitle.textContent = "Загрузчик файлов";

    const appDescriptionContainer = document.createElement("div");
    appDescriptionContainer.className = "app-description-container";

    const appDescriptionList = document.createElement("ul");
    appDescriptionList.className = "app-description__list";

    this.imagePreviewContainer = document.createElement("div");
    this.imagePreviewContainer.className = "image-preview-container";
    this.page.appendChild(main);

    main.appendChild(appTitle);
    main.appendChild(appDescriptionList);

    descriptions.forEach((text) => {
      const listItem = document.createElement("li");
      listItem.className = "app-description__list-item";
      listItem.textContent = text;
      appDescriptionList.appendChild(listItem);
    });

    main.appendChild(this.fileUploader.getElement());
    main.appendChild(this.imagePreviewContainer);

    this.imagePreviewer.setContainer(this.imagePreviewContainer);
    this.fileUploader.setPreloader(this.preloader);
  }
}
