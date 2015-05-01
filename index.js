
module.exports = function (params) {
  return function (opts, resilient) {
    var middleware = { type: 'discovery' }
    
    middleware.in = function (options, next) {
      next()
    }
    
    middleware.out = function (req, res, next) {
      next()
    }
    
    return middleware
  }
}
