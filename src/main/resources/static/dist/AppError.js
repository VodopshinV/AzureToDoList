export class AppError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.timestamp = new Date();
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=AppError.js.map