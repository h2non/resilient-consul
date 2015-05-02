var basePath = '/v1/catalog/service/'
var defaultService = 'consul'
var requiredParams = ['service', 'servers']

module.exports = function (params) {
  var type = 'discovery'
  params = params || {}

  requiredParams.forEach(function (key) {
    if (!params[key]) {
      throw new TypeError('Missing required param: ' + key)
    }
  })

  params.basePath = basePath + params.service

  if (params.discoveryService) {
    params.refreshPath = basePath + params.discoveryService
    params.enableSelfRefresh = true
  } 
  else if (params.enableSelfRefresh) {
    params.refreshPath = basePath + defaultService
  }

  function consul(options, resilient) {

    function in(err, res, next) {
      if (err) return next()

    }
    
    function out(options, next) {
      next()
    }
    
    return {
      'in': in,
      'out': out
    }
  }
  
  consul.type = type
  
  return consul
}
