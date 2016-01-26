;(function (root, factory) {
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
    params = validateParams(params || {})

    // Use the built-in servers mapper, if required
    var mapServers = params.mapServers || (params.onlyHealthy
        ? mapServersFromHealthEndpoint
        : mapServersFromCatalogEndpoint)

    // Define Consul base path based on the lookup type
    var basePath = params.onlyHealthy
      ? '/v1/health/service/'
      : '/v1/catalog/service/'

    // Define the service specific base path
    params.basePath = basePath + params.service

    // Enable self discovery capatibility
    if (params.discoveryService) {
      params.refreshPath = basePath + params.discoveryService
      params.enableSelfRefresh = true
    }

    // Middleware constructor function
    function consul (options, resilient) {
      defineResilientOptions(params, options)

      return {
        // Incoming traffic middleware
        'in': function inHandler (err, res, next) {
          if (err) return next()

          if (Array.isArray(res.data)) {
            res.data = mapServers(res.data)
          }

          next()
        },
        // Outgoing traffic middleware
        'out': function outHandler (options, next) {
          options.params = options.params || {}

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
      }
    }

    // Define middleware type
    consul.type = 'discovery'

    // Expose the middleware function
    return consul

    function hasAddress (svc) {
      return svc && (svc.Address || s.ServiceAddress)
    }

    function mapServersFromHealthEndpoint (list) {
      return list.map(function buildServiceUrl (s) {
        return (params.protocol || 'http') + '://' + s.Service.Address + ':' + (+s.Service.Port || 80)
      })
    }

    function mapServersFromCatalogEndpoint (list) {
      return list.filter(hasAddress).map(function buildServiceUrl (s) {
        return (params.protocol || 'http') + '://' + (s.ServiceAddress || s.Address) + ':' + (+s.ServicePort || 80)
      })
    }
  }

  function validateParams (params) {
    var missing = requiredParams.filter(function (key) {
      return !params[key]
    })

    if (missing.length) {
      throw new TypeError('Missing required params: ' + missing.join(', '))
    }

    return params
  }

  function defineResilientOptions (params, options) {
    Object.keys(params)
    .filter(function (key) {
      return !~consulParams.indexOf(key)
    })
    .forEach(function (key) {
      options.set(key, params[key])
    })
  }
}))
