export class Modal {
  constructor(message) {
    this.message = message;
    this.modal = null;
  }

  createModal() {
    this.modal = document.createElement("div");
    this.modal.className = "modal";
    this.onClose = null;

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    const modalMessage = document.createElement("p");
    modalMessage.className = "modal-content__message";
    modalMessage.textContent = this.message;

    const closeButton = document.createElement("button");
    closeButton.className = "modal-close-button";
    closeButton.textContent = "Закрыть";
    closeButton.addEventListener("click", () => this.closeModal());

    modalContent.append(modalMessage);
    modalContent.appendChild(closeButton);
    this.modal.appendChild(modalContent);
    document.body.appendChild(this.modal);
  }

  show() {
    this.createModal();
  }

  closeModal() {
    if (this.modal) {
      this.modal.remove();
    }
    if (this.onClose) {
      this.onClose();
    }
  }
}
