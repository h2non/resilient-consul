
module.exports = function (params) {
  var type = 'discovery'
  
  function consul(options, resilient) {
    function in(res, next) {
      next()
    }
    
    function out(options, next) {
      next()
    }
    
    return {
      in: in,
      out: out
    }
  }
  
  consul.type = type
  
  return consul
}
