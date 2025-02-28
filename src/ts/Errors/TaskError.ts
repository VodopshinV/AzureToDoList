import { AppError } from "./AppError.js";

export class TaskError extends AppError {
    constructor(message: string) {
        super(message);
    }
}