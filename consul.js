(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory)
  } else if (typeof exports === 'object') {
    factory(exports)
    if (typeof module === 'object' && module !== null) {
      module.exports = exports = exports.resilientConsul
    }
  } else {
    factory(root)
  }
}(this, function (exports) {

  var basePath = '/v1/catalog/service/'
  var requiredParams = ['service', 'servers']
  var consulParams = ['service', 'datacenter', 'protocol', 'tag', 'mapServers']

  exports.resilientConsul = function (params) {
    params = params || {}

    requiredParams.forEach(function (key) {
      if (!params[key]) {
        throw new TypeError('Missing required param: ' + key)
      }
    })

    params.basePath = basePath + params.service
    params.mapServers = params.mapServers || mapServers;

    if (params.discoveryService) {
      params.refreshPath = basePath + params.discoveryService
      params.enableSelfRefresh = true
    }

    function consul(options, resilient) {
      defineOptions(options)

      function inHandler(err, res, next) {
        if (err) return next()
        
        if (Array.isArray(res.data)) {
          res.data = params.mapServers(res.data)
        }

        next()
      }
      
      function outHandler(options, next) {
        options.params = options.params || {}

        if (params.datacenter) {
          options.params.dc = params.datacenter
        }

        if (params.tag) {
          options.params.tag = params.tag
        }

        next()
      }
      
      return {
        'in': inHandler,
        'out': outHandler
      }
    }
    
    consul.type = 'discovery'
    
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

}))
