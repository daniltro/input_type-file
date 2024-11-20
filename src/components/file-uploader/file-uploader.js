import { calculationImageSize, formatUploadedAt } from "../../utils/utils";
import { Modal } from "../modal/Modal";

export class FileUploader {
  constructor(onFilesUploaded, pageSelector, imagePreviewer) {
    this.downloadFiles = [];
    this.onFilesUploaded = onFilesUploaded;
    this.page = document.querySelector(pageSelector);
    this.createLayout();
    this.bindEvents();
    this.preloader = null;
    this.maxFiles = 5;
    this.maxFileSize = 10 * 1024 * 1024;
    this.imagePreviewer = imagePreviewer;
    this.imagePreviewer.setUpdateErrorStateCallback(
      this.updateErrorState.bind(this)
    );
    this.imagePreviewer.setValidateFormCallback(this.validateForm.bind(this));
  }

  updateErrorState() {
    this.clearErrorMessages();
    const hasTooManyFiles = this.checkFileCount(this.downloadFiles.length);
    const invalidFormatFiles = this.checkFileFormats(this.downloadFiles);
    const largeFiles = this.checkFileSizes(this.downloadFiles);
    if (hasTooManyFiles) this.displayFileCountError(true);
    if (invalidFormatFiles.length > 0)
      this.displayFormatErrors(invalidFormatFiles);
    if (largeFiles.length > 0) this.displaySizeErrors(largeFiles);
    this.validateForm();
  }

  setPreloader(preloader) {
    this.preloader = preloader;
  }

  createLayout() {
    this.fileUploadForm = document.createElement("form");
    this.fileUploadForm.className = "upload-form";

    this.fileUploadForm.setAttribute("method", "POST");
    this.fileUploadForm.setAttribute("action", "http://localhost:3000/files");

    this.formControls = document.createElement("div");
    this.formControls.className = "form-controls";

    this.fileInputLabel = document.createElement("label");
    this.fileInputLabel.className = "file-input-label";

    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.id = "file-input";
    this.fileInput.className = "upload-form__file-input";
    this.fileInput.multiple = true;

    this.customFileInput = document.createElement("a");
    this.customFileInput.textContent = "выберите файлы";
    this.customFileInput.className = "custom-file-input";

    this.dragndropMessage = document.createElement("span");
    this.dragndropMessage.className = "drag-n-drop-message";
    this.dragndropMessage.textContent = "Перетащите файлы сюда или ";

    this.fileStatusLabel = document.createElement("div");
    this.fileStatusLabel.className = "file-status";
    this.fileStatusLabel.textContent = `Файлов добавлено: ${this.downloadFiles.length}`;

    this.submitButton = document.createElement("button");
    this.submitButton.disabled = true;
    this.submitButton.type = "submit";
    this.submitButton.textContent = "Загрузить";
    this.submitButton.className = "upload-form__submit-button";

    this.fileUploadForm.appendChild(this.formControls);

    this.formControls.appendChild(this.fileInputLabel);
    this.fileInputLabel.appendChild(this.fileInput);
    this.fileInputLabel.appendChild(this.dragndropMessage);
    this.dragndropMessage.appendChild(this.customFileInput);
    this.fileUploadForm.appendChild(this.fileStatusLabel);
    this.fileUploadForm.appendChild(this.submitButton);

    this.page.appendChild(this.fileUploadForm);

    this.errorMessageToMuchFiles = document.createElement("span");
    this.errorMessageToMuchFiles.className = "error-message";
    this.errorMessageToMuchFiles.textContent = `Превышено допустимое количество файлов: ${this.maxFiles}`;

    this.errorMessageFormatFiles = document.createElement("span");
    this.errorMessageFormatFiles.className = "error-message";
    this.errorMessageFormatFiles.textContent = "Неверный формат файла";
  }

  bindEvents() {
    this.customFileInput.addEventListener("click", (e) => {
      e.preventDefault();
      this.fileInput.click();
    });
    this.fileInput.addEventListener("change", (e) => this.handleFileChange(e));
    this.fileUploadForm.addEventListener("submit", (e) => this.handleSubmit(e));
    this.fileUploadForm.addEventListener("dragenter", (e) =>
      this.handleDragEnter(e)
    );
    this.fileUploadForm.addEventListener("dragover", (e) =>
      this.handleDragOver(e)
    );
    this.fileUploadForm.addEventListener("dragleave", (e) =>
      this.handleDragLeave(e)
    );
    this.fileUploadForm.addEventListener("drop", (e) => this.handleDrop(e));
  }

  handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.fileUploadForm.classList.add("drag-over");
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.fileUploadForm.classList.add("drag-over");
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.relatedTarget || !this.fileUploadForm.contains(e.relatedTarget)) {
      this.fileUploadForm.classList.remove("drag-over");
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.fileUploadForm.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files);
    this.handleFileSelection(files);
  }

  handleFileSelection(files) {
    const totalFiles = this.downloadFiles.length + files.length;
    const duplicateFiles = this.checkForDuplicates(files, this.downloadFiles);
    if (duplicateFiles.length > 0) {
      this.displayDuplicateFileErrors(duplicateFiles);
      return;
    }

    const result = this.addFiles(files, totalFiles);
    if (result.success) {
      this.fileStatusLabel.textContent = `Файлов добавлено: ${this.downloadFiles.length}`;
      this.onFilesUploaded(this.downloadFiles);
      this.validateForm();
    }
  }

  handleFileChange(e) {
    const newFiles = Array.from(e.target.files);
    const totalFiles = this.downloadFiles.length + newFiles.length;
    this.clearErrorMessages();
    const duplicateFiles = this.checkForDuplicates(
      newFiles,
      this.downloadFiles
    );
    if (duplicateFiles.length > 0) {
      this.displayDuplicateFileErrors(duplicateFiles);
      return;
    }

    const result = this.addFiles(newFiles, totalFiles);
    if (result.success) {
      this.fileStatusLabel.textContent = `Файлов добавлено: ${this.downloadFiles.length}`;
      this.onFilesUploaded(this.downloadFiles);
      this.validateForm();
    }
    e.target.value = "";
  }

  checkForDuplicates(files, existingFiles) {
    return files.filter((file) =>
      existingFiles.some((downloadedFile) => downloadedFile.name === file.name)
    );
  }

  handleFileErrors(files, totalFiles) {
    const hasTooManyFiles = this.checkFileCount(totalFiles);
    const invalidFormatFiles = this.checkFileFormats(files);
    const largeFiles = this.checkFileSizes(files);
    const errors = {
      hasTooManyFiles,
      invalidFormatFiles,
      largeFiles,
    };

    if (hasTooManyFiles) {
      this.displayFileCountError(true);
    }
    if (invalidFormatFiles.length > 0) {
      this.displayFormatErrors(invalidFormatFiles);
    }
    if (largeFiles.length > 0) {
      this.displaySizeErrors(largeFiles);
    }

    return {
      errors,
      validFiles: files.filter(
        (file) =>
          !invalidFormatFiles.includes(file) && !largeFiles.includes(file)
      ),
    };
  }

  addFiles(files, totalFiles) {
    const { errors, validFiles } = this.handleFileErrors(files, totalFiles);

    if (
      errors.hasTooManyFiles ||
      errors.invalidFormatFiles.length > 0 ||
      errors.largeFiles.length > 0
    ) {
      return { success: false, validFiles: [] };
    }

    const filesToUpload =
      totalFiles > this.maxFiles
        ? validFiles.slice(0, this.maxFiles - this.downloadFiles.length)
        : validFiles;

    this.downloadFiles = this.downloadFiles.concat(filesToUpload);
    return { success: true, filesToUpload };
  }

  validateForm() {
    const hasTooManyFiles = this.downloadFiles.length > this.maxFiles;
    const hasInvalidFormats =
      this.checkFileFormats(this.downloadFiles).length > 0;
    const hasLargeFiles = this.checkFileSizes(this.downloadFiles).length > 0;

    this.submitButton.disabled =
      this.downloadFiles.length === 0 ||
      hasTooManyFiles ||
      hasInvalidFormats ||
      hasLargeFiles;
  }

  checkFileCount(totalFiles) {
    return totalFiles > this.maxFiles;
  }

  checkFileFormats(files) {
    const allowedFormats = ["image/jpg", "image/jpeg", "image/png"];
    return files.filter((file) => !allowedFormats.includes(file.type));
  }

  checkFileSizes(files) {
    return files.filter((file) => file.size > this.maxFileSize);
  }

  displayFileCountError(hasError) {
    if (hasError) {
      const errorMessage = document.createElement("span");
      errorMessage.className = "error-message";
      errorMessage.textContent = `Превышено допустимое количество файлов: ${this.maxFiles}`;
      this.fileUploadForm.appendChild(errorMessage);
    }
  }

  displayFormatErrors(invalidFiles) {
    invalidFiles.forEach((file) => {
      const formatError = document.createElement("span");
      formatError.className = "format-error error-message";
      formatError.textContent = `Недопустимый формат файла: ${file.name}`;
      this.fileUploadForm.appendChild(formatError);
    });
  }

  displaySizeErrors(largeFiles) {
    largeFiles.forEach((file) => {
      const sizeError = document.createElement("span");
      sizeError.className = "size-error error-message";
      sizeError.textContent = `Превышен максимальный размер файла: ${file.name}`;
      this.fileUploadForm.appendChild(sizeError);
    });
  }

  displayDuplicateFileErrors(duplicateFiles) {
    duplicateFiles.forEach((file) => {
      const duplicateError = document.createElement("span");
      duplicateError.className = "duplicate-error error-message";
      duplicateError.textContent = `Файл "${file.name}" уже добавлен.`;
      this.fileUploadForm.appendChild(duplicateError);
      console.log("Файл уже добавлен");
    });
  }

  clearErrorMessages() {
    this.fileUploadForm
      .querySelectorAll(".error-message")
      .forEach((error) => error.remove());
  }

  handleSubmit(e) {
    e.preventDefault();
    
    this.preloader.show();

    const formData = new FormData();

    this.downloadFiles.forEach((file) => formData.append("files[]", file));

    for (let [key, value] of formData.entries()) {
      console.log(`Объект formData: ${key}:`, value);
    }

    const dataToSend = {
      uploadedAt: formatUploadedAt,
      files: this.downloadFiles.map((file) => ({
        name: file.name,
        size: `${calculationImageSize(file.size)}`,
        type: file.type,
      })),
    };

    console.log("Данные для отправки на сервер:", dataToSend);

    setTimeout(() => {
      fetch(this.fileUploadForm.getAttribute("action"), {
        method: this.fileUploadForm.getAttribute("method"),
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })
        .then((res) => res.json())
        .then((data) => {
          this.preloader.hide();
          console.log("Данные о файлах загруженных на сервер:", data);
          const successModal = new Modal("Файлы успешно отправлены на сервер!");
          successModal.show();

          successModal.onClose = () => {
            this.imagePreviewer.displayImages([]);
            this.downloadFiles = [];
            this.fileStatusLabel.textContent = `Файлов добавлено: 0`;
            this.clearErrorMessages();
            this.validateForm();
          };
        })
        .catch((error) => {
          this.preloader.hide();
          console.log(`Ошибка загрузки файлов ${error}`);
          const successModal = new Modal("Ошибка загрузки файлов!");
          successModal.show();
        });
    }, 2000);
  }

  getElement() {
    return this.fileUploadForm;
  }

  updateFileCountDisplay() {
    this.fileStatusLabel.textContent = `Файлов добавлено: ${this.downloadFiles.length}`;
  }

  removeFile(fileName) {
    this.downloadFiles = this.downloadFiles.filter(
      (file) => file.name !== fileName
    );
    this.updateFileCountDisplay();
    this.validateForm();
  }
}
