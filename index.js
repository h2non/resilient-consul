
module.exports = function (params) {
  return function consul(opts, resilient) {
    var type = 'discovery'
    
    function in(options, next) {
      next()
    }
    
    function out(req, res, next) {
      next()
    }
    
    return {
      in: in,
      out: out,
      type: type
    }
  }
}
