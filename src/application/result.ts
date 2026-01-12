export type Result<T, E = Error> = Success<T, E> | Failure<T, E>;

export class Success<T, E> {
    readonly isSuccess = true;
    readonly isFailure = false;

    constructor(readonly value: T) { }

    getValue(): T {
        return this.value;
    }
}

export class Failure<T, E> {
    readonly isSuccess = false;
    readonly isFailure = true;

    constructor(readonly error: E) { }

    getError(): E {
        return this.error;
    }
}

export const ok = <T, E>(value: T): Result<T, E> => new Success(value);
export const fail = <T, E>(error: E): Result<T, E> => new Failure(error);
