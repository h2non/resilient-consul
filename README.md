# resilient-consul  [![Build Status](https://travis-ci.org/h2non/resilient-consul.svg?branch=master)](https://travis-ci.org/h2non/resilient-consul) [![Resilient](https://img.shields.io/badge/I'm-resilient-green.svg?style=flat-square)](http://resilient-http.github.io) 

[resilient.js](https://github.com/resilient-http/resilient.js) HTTP client 
[middleware](https://github.com/resilient-http/resilient.js#middleware-layer) for [Consul](https://www.consul.io).

Via this middleware you can use Consul as compatible discovery server in Resilient HTTP clients.
Works with Consul HTTP API `v1` and resilient.js `+0.3`

<table>
<tr>
<td><b>Name</b></td><td>consul</td>
</tr>
<tr>
<td><b>Type</b></td><td>discovery</td>
</tr>
<tr>
<td><b>Resilient</b></td><td>+0.3</td>
</tr>
<tr>
<td><b>Environments</b></td><td>node.js / browsers</td>
</tr>
</table>

## Installation

### Node.js

```
npm install resilient-consul --save
```

### Browser

Via Bower:
```
bower install resilient-consul --save
```

Via Component:
```
component install h2non/resilient-consul
```

Or loading the script directly:
```html
<script src="//cdn.rawgit.com/h2non/resilient-consul/0.1.4/consul.js"></script>
```

## Usage

```js
var Resilient = require('resilient')
var consul = require('resilient-consul')

var client = Resilient()

client.use(consul({
  // App service name (required)
  service: 'web',
  // Service name for self discovery (optional)
  discoveryService: 'consul',
  // Use a custom datacenter (optional)
  datacenter: 'ams2',
  // Use a custom service tag (optional)
  tag: '1.0',
  // Consul servers pool
  servers: [
    'http://demo.consul.io',
    'http://demo.consul.io'
  ],
  // Use Consul's health check endpoint instead of the catalog
  // to retrieve only services with passing health checks (optional)
  onlyHealthy: false,
  // Use a custom mapping function (optional)
  mapServers: function (list) {
    // here you can filter/map the services retrieved from Consul
    // to a list of addresses according to custom logic (optional)
    return list.map(function (svc) { return svc.ServiceAddress + '/v1' })
  }
}))

// Test request
client.get('/', function (err, res) {
  console.log('Error:', err)
  console.log('Response:', res)
})
```

#### Browser usage

If you're running Resilient in the browser, you must enable CORS headers in Consul.
To do that you can define additional response HTTP headers in the Consul config file:

```
"http_api_response_headers": {
  "Access-Control-Allow-Origin": "*"
}
```

## Options

- **service** `string` - Consul service. Required
- **servers** `array<string>` - List of Consul servers URLs. Required
- **discoveryService** `string` - Consul discovery service for self discovery (e.g: consul)
- **datacenter** `string` - Custom datacenter to use. If not defined the default one will be used 
- **tag** `string` - Use a specific tag for the service
- **onlyHealthy** `boolean` - Use Consul's health check endpoint instead of the catalog to retrieve only services with passing health checks. Default to `false`
- **protocol** `string` - Transport URI protocol. Default to `http`
- **mapServers** `function` - Custom function for creating the list of service addresses based on the Consul response

Additionally you can pass any of the supported Resilient 
[discovery options](https://github.com/resilient-http/resilient.js#discovery) via this middleware

## License

MIT - Tomas Aparicio
