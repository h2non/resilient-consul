# resilient-consul  [![Build Status](https://travis-ci.org/h2non/resilient-consul.svg?branch=master)](https://travis-ci.org/h2non/resilient-consul)

[resilient.js](https://github.com/resilient-http/resilient.js) HTTP client 
[middleware](https://github.com/resilient-http/resilient.js#middleware) for [Consul](https://www.consul.io)

Works with Consul HTTP API `v1` and resilient.js `+0.3`

## Installation

### Node

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
<script src="//cdn.rawgit.com/h2non/resilient-consul/0.1.1/resilient-consul.js"></script>
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
  // Specificy a custom datacenter (optional)
  datacenter: 'ams2',
  // Consul servers pool
  servers: [
    'http://demo.consul.io',
    'http://demo.consul.io'
  ]
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
- **discoveryService** `string` - Consul discovery service for auto balancing
- **datacenter** `string` - Custom datacenter to use. If not defined the default one will be used 
- **protocol** `string` - Transport URI protocol. Default to `http`

Additionally you can pass any of the supported Resilient 
[discovery options](https://github.com/resilient-http/resilient.js#discovery) via this middleware

## License

MIT - Tomas Aparicio
