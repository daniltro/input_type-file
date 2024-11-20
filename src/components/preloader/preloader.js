export class Preloader {
  constructor() {
    this.preloader = this.createPreloader();
    this.isVisible = false;
  }

  createPreloader() {
    const preloader = document.createElement("div");
    preloader.className = "preloader";
    preloader.innerHTML = `<div class="loader"></div>`;
    preloader.style.display = "none";
    document.body.appendChild(preloader);
    return preloader;
  }

  show() {
    this.preloader.style.display = "flex";
    this.isVisible = true;
  }

  hide() {
    this.preloader.style.display = "none";
    this.isVisible = false;
  }
}
