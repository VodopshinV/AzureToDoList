export class AppError extends Error {
    public readonly timestamp: Date;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.timestamp = new Date();
        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}