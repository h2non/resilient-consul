var basePath = '/v1/catalog/service/'
var requiredParams = ['service', 'servers']
var consulParams = ['service', 'datacenter', 'protocol']

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

  function consul(options, resilient) {
    defineOptions(options)

    function inHandler(err, res, next) {
      if (err) return next()
      
      if (Array.isArray(res.data)) {
        res.data = mapServers(res.data)
      }

      next()
    }
    
    function outHandler(options, next) {
      options.params = options.params || {}

      if (params.datacenter) {
        options.params.dc = params.datacenter
      }

      next()
    }
    
    return {
      'in': inHandler,
      'out': outHandler
    }
  }
  
  consul.type = type
  
  return consul

  function mapServers(list) {
    var protocol = params.protocol || 'http'
    
    return list
    .filter(function (s) {
      return s && s.Address
    })
    .map(function (s) {
      if (s.ServiceAddress) {
        return s.ServiceAddress
      }      
      return protocol + '://' + s.Address + ':' + (+s.ServicePort || 80)
    })
  }

  function defineOptions(options) {
    Object.keys(params)
    .filter(function (key) {
      return !~consulParams.indexOf(key)
    })
    .forEach(function (key) {
      options.set(key, params[key])
    })
  }
}