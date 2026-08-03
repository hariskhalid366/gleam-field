import { isFulfilled, type Middleware } from "@reduxjs/toolkit";

const successLogger: Middleware = () => (next) => (action) => {
  if (isFulfilled(action)) {
    // Mutation-specific confirmation remains controlled by the screen controller.
  }
  return next(action);
};

export default successLogger;
