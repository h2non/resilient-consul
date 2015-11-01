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

  var requiredParams = ['service', 'servers']
  var consulParams = ['service', 'datacenter', 'protocol', 'tag', 'mapServers', 'onlyHealthy']

  exports.resilientConsul = function (params) {
    params = params || {}

    requiredParams.filter(function (key) { 
      return !params[key] 
    })
    .forEach(function (key) {
      throw new TypeError('Missing required param: ' + key)
    })

    var basePath = params.onlyHealthy ? '/v1/health/service/' : '/v1/catalog/service/'

    params.basePath = basePath + params.service
    if (!params.mapServers) {
      params.mapServers = params.onlyHealthy ? mapServersFromHealthEndpoint : mapServersFromCatalogEndpoint
    }

    if (params.discoveryService) {
      params.refreshPath = basePath + params.discoveryService
      params.enableSelfRefresh = true
    }

    consul.type = 'discovery'

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

        if (params.onlyHealthy) {
          options.params.passing = true
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
        
    return consul

    function mapServersFromHealthEndpoint(list) {
      var protocol = params.protocol || 'http'
      
      return list.map(function (s) {
        return protocol + '://' + s.Service.Address + ':' + (+s.Service.Port || 80)
      })
    }

    function mapServersFromCatalogEndpoint(list) {
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
