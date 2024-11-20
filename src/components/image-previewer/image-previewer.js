import { calculationImageSize } from "../../utils/utils";

export class ImagePreviewer {
  constructor(containerSelector) {
    this.imagePreviewContainer = document.querySelector(containerSelector);
    this.imageCards = [];
    this.updateErrorStateCallback = null;
    this.onFileDeleted = null;
    this.validateFormCallback = null;
  }

  bindEvents() {
    this.imageCards.forEach((card) => {
      card.addEventListener("dragstart", this.handleDragStart.bind(this));
      card.addEventListener("dragover", this.handleDragOver.bind(this));
      card.addEventListener("drop", this.handleDrop.bind(this));

      const deleteButton = card.querySelector(".image-card__delete-button");
      if (deleteButton) {
        deleteButton.addEventListener(
          "click",
          this.handleDeleteCard.bind(this, card)
        );
      }
    });
  }

  setValidateFormCallback(callback) {
    this.validateFormCallback = callback;
  }

  handleDeleteCard(card) {
    const fileName = card
      .querySelector(".image-info__title")
      .getAttribute("data-full-name");

    this.imagePreviewContainer.removeChild(card);

    this.imageCards = this.imageCards.filter((el) => {
      return el.id !== card.id;
    });

    if (this.updateErrorStateCallback) {
      this.updateErrorStateCallback();
    }

    if (this.onFileDeleted) {
      this.onFileDeleted(fileName);
    }

    if (this.imageCards.length === 0 && this.validateFormCallback) {
      this.validateFormCallback();
    }
  }

  setUpdateErrorStateCallback(callback) {
    this.updateErrorStateCallback = callback;
  }

  setContainer(container) {
    this.imagePreviewContainer = container;
  }

  displayImages(files) {
    this.imagePreviewContainer.innerHTML = "";
    this.imageCards = [];
    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      const imageContainer = document.createElement("div");
      imageContainer.className = "image-container";

      const imageCard = document.createElement("div");
      imageCard.className = "image-card";
      imageCard.draggable = true;
      imageCard.id = `image-card-${i}`;

      const imageInfo = document.createElement("div");
      imageInfo.className = "image-info";

      const infoList = document.createElement("ul");
      infoList.className = "image-info__list";

      const imageTitle = document.createElement("li");
      imageTitle.className = "image-info__title";
      imageTitle.textContent = `Название: ${file.name}`;
      imageTitle.setAttribute("data-full-name", file.name);

      const imageFormat = document.createElement("li");
      imageFormat.className = "image-info__format";
      imageFormat.textContent = `Формат: ${file.type}`;

      const imageSize = document.createElement("li");
      imageSize.className = "image-info__size";
      imageSize.textContent = `Размер: ${calculationImageSize(file.size)}`;

      const fileURL = URL.createObjectURL(file);
      const image = document.createElement("img");
      image.src = fileURL;
      image.alt = file.name;
      image.className = "image-preview";

      const deleteButtonBox = document.createElement("div");
      deleteButtonBox.className = "image-card__button-box";

      const deleteButton = document.createElement("button");
      deleteButton.className = "image-card__delete-button";
      deleteButton.type = "button";

      infoList.appendChild(imageTitle);
      infoList.appendChild(imageFormat);
      infoList.appendChild(imageSize);

      this.imagePreviewContainer.appendChild(imageCard);

      imageCard.appendChild(deleteButtonBox);
      imageCard.appendChild(imageContainer);
      imageCard.appendChild(imageInfo);

      imageContainer.appendChild(image);

      deleteButtonBox.appendChild(deleteButton);
      
      imageInfo.appendChild(infoList);

      this.imagePreviewContainer.appendChild(imageCard);

      this.imageCards.push(imageCard);
    }
    this.bindEvents();
  }

  handleDragStart(e) {
    e.dataTransfer.setData("id", e.target.id);
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e) {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("id");
    const draggedElement = document.getElementById(draggedId);
    const dropTarget = e.target.closest(".image-card");

    if (dropTarget && draggedElement !== dropTarget) {
      if (this.imagePreviewContainer.firstChild === dropTarget) {
        this.imagePreviewContainer.insertBefore(draggedElement, dropTarget);
      } else {
        this.imagePreviewContainer.insertBefore(
          draggedElement,
          dropTarget.nextSibling
        );
      }
      this.imageCards = Array.from(this.imagePreviewContainer.children);
    }
  }
}
