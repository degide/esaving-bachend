import "express";
import "multer";

declare global {
  namespace Express {
    interface Request {
      token: string;
    }
  }

  /* Global variables follow. They *must* use var to work.
        and cannot be initialized here. */

  var Foo: string;
}

export {};
