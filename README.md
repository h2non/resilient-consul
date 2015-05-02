# resilient-consul

[resilient.js](https://github.com/resilient-http/resilient.js) HTTP client middleware for [Consul](https://www.consul.io) 

Works with Consul HTTP API `v1` and resilient.js `+0.3`

## Installation

### Node

```
npm install resilient-consul
```

### Browser

```
bower install resilient-consul
```

```
component install h2non/resilient-consul
```

```
<script src="//cdn.rawgit.com/h2non/resilient-consul/0.1.0/resilient-consul.js"></script>
```

## Example

```js
var Resilient = require('resilient')
var consul = require('resilient-consul')

var client = Resilient()

client.use(consul({
  // App service name (required)
  service: 'web',
  // Discovery service name (optional, default to consul)
  discoveryService: 'consul',
  // Specificy a custom datacenter (optional)
  datacenter: 'ams2',
  // auto refresh servers from Consul (optional, default to false)
  enableSelfRefresh: true,
  // Consul servers pool
  servers: [
    'http://demo.consul.net',
    'http://demo.consul.net'
  ]
}))

// Test request
client.get('/', function (err, res) {
  console.log('->', err, res)
})
```

## Options

- **service** `string` - Consul service. Required
- **discoveryService** `string` - Consul discovery service for auto balancing

## License

MIT - Tomas Aparicio
