
module.exports = function (params) {
  consul.type = 'discovery'
  
  function consul(opts, resilient) {
    function in(options, next) {
      next()
    }
    
    function out(req, res, next) {
      next()
    }
    
    return {
      in: in,
      out: out
    }
  }

  return consul
}
