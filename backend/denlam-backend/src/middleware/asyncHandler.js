// Évite d'écrire un try/catch dans chaque controller : toute erreur
// levée dans un handler async est transmise à errorHandler via next().
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
