class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class UnauthorizedResponse extends Response {
  constructor(message: string = "Unauthorized") {
    super(JSON.stringify({ error: message }), { status: 401 });
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class NotFoundResponse extends Response {
  constructor(message: string = "Not found") {
    super(JSON.stringify({ error: message }), { status: 404 });
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}
export class ForbiddenResponse extends Response {
  constructor(message: string = "Forbidden") {
    super(JSON.stringify({ error: message }), { status: 403 });
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}

export class InternalServerResponse extends Response {
  constructor(message: string = "Internal server error") {
    super(JSON.stringify({ error: message }), { status: 500 });
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export class BadRequestResponse extends Response {
  constructor(message: string = "Bad request") {
    super(JSON.stringify({ error: message }), { status: 400 });
  }
}
