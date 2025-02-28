export type NotificationType = "error" | "success";

export class NotificationManager{
    private container: HTMLElement;

    constructor(containerId: string){
        const container = document.getElementById(containerId);
        if(!container){
            throw new Error(`Notification container with id "${containerId}" not found.`);
        }
        this.container = container;
    }

    /**
     * Show a notification message
     * @param message - The message to display
     * @param type - The type of notification
     * @param duration - The duration in milliseconds to show the notification (default: 3000)
     */

    showNotification(message: string, type: NotificationType ="error", duration = 3000){
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;

        this.container.appendChild(notification);

        // remove the notification after the duration
        setTimeout(() => {
            notification.classList.add("fade-out");
            notification.addEventListener("transitionend", () => {
                notification.remove();
            });
        }, duration);
    }
}