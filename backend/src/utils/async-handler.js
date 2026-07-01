export default function asyncHandler(controller) {
  return function wrappedController(req, res, next) {
    // Express 5 understands rejected promises, but wrapping controllers keeps
    // every route visually consistent and makes async error flow obvious.
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}
