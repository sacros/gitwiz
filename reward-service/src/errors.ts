import * as httpError from "http-errors"
import { logger } from "./logger/logger"

export const enum ErrorCategories {
  ApplicationError = "ApplicationError",
  ControllerError = "ControllerError",
  RepoError = "RepoError"
}

interface IErrorDescriptor {
  code: string
  defaultMessage: string
  create: IErrorFactory
}

type IErrorFactory = (message?: string, meta?: any[]) => Error

class BaseError extends Error {
  constructor(
    public context: string,
    public code: string,
    message: string,
    public meta?: any[]
  ) {
    super(message)
    this.context = context
    this.code = code
    this.meta = meta
  }
  public toString() {
    return toStringRepr({
      name: this.name,
      context: this.context,
      code: this.code,
      message: this.message,
      meta: this.meta
    })
  }

  public toJSON() {
    return {
      name: this.name,
      context: this.context,
      code: this.code,
      message: this.message,
      meta: this.meta
    }
  }
}

export namespace ApplicationError {
  export class ApplicationError extends BaseError {
    constructor(
      public context: string,
      code: string,
      message: string,
      public meta?: any[]
    ) {
      super(context, code, message, meta)
      this.name = ErrorCategories.ApplicationError
    }
  }

  export class InvalidConfig extends ApplicationError {
    constructor(code: string, message: string, meta?: any[]) {
      super("InvalidConfig", code, message, meta)
    }
  }
}

export namespace ControllerError {
  export class ControllerError extends BaseError {
    public httpStatus: number = 400
    constructor(
      public context: string,
      code: string,
      message: string,
      public meta?: any[]
    ) {
      super(context, code, message, meta)
      this.name = ErrorCategories.ControllerError
    }
  }

  export class RequiredEntityNotFound extends ControllerError {
    public httpStatus: number = 422
    constructor(
      code: string,
      message: string = "Could not find required entity for processing request",
      meta?: any[]
    ) {
      super("RequiredEntityNotFound", code, message, meta)
    }
  }

  export class InvalidParams extends ControllerError {
    public httpStatus: number = 400
    constructor(
      code: string,
      message: string = "Supplied params are invalid",
      meta?: any[]
    ) {
      super("InvalidParams", code, message, meta)
    }
  }

  export class MissingParams extends ControllerError {
    public httpStatus: number = 400
    constructor(
      code: string,
      message: string = "Required params are missing",
      meta?: any[]
    ) {
      super("MissingParams", code, message, meta)
    }
  }
}

export namespace RepoError {
  export class RepoError extends BaseError {
    public httpStatus: number = 422
    constructor(
      public context: string,
      code: string,
      message: string,
      public meta?: any[]
    ) {
      super(context, code, message, meta)
      this.name = ErrorCategories.RepoError
    }
  }

  export class EntityNotFound extends RepoError {
    public httpStatus: number = 404
    constructor(
      code: string,
      message: string = "Given identifier is insufficient/invalid",
      meta?: any[]
    ) {
      super("EntityNotFound", code, message, meta)
    }
  }
  export class OperationConstraintsViolated extends RepoError {
    public httpStatus: number = 422
    constructor(
      code: string,
      message: string = "This operation is not allowed allowed on the entity",
      meta?: any[]
    ) {
      super("OperationNotAllowedOnEntity", code, message, meta)
    }
  }
}

const toStringRepr = (obj: {
  name: string
  context: string
  code: string
  message: string
  meta?: any[]
}) => {
  const { name, context, code, message, meta } = obj
  const messageArgs = [`${name}`, `${context}`, `${code}`, `${message}`]
  if (meta) {
    messageArgs.push(`${JSON.stringify(meta)}`)
  }
  return messageArgs.join(" - ")
}

export const globalErrorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (
      err instanceof RepoError.RepoError ||
      err instanceof ControllerError.ControllerError
    ) {
      ctx.response.status = err.httpStatus
      ctx.body = err.toJSON()
    } else {
      ctx.response.status = 500
      ctx.body = {
        error: true,
        message: err.toString()
      }
    }
  }
}
