import { App } from "./components/app/app";
import { FileUploader } from "./components/file-uploader/file-uploader";
import { ImagePreviewer } from "./components/image-previewer/image-previewer";
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  const imagePreviewer = new ImagePreviewer(".image-preview-container");

  const fileUploader = new FileUploader(
    (files) => {
      imagePreviewer.displayImages(files);
    },
    ".page",
    imagePreviewer
  );

  imagePreviewer.onFileDeleted = (fileName) => {
    fileUploader.removeFile(fileName);
  };

  new App(".page", fileUploader, imagePreviewer);
});
