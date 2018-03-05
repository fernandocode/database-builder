
export class DatabaseBuilderError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}
