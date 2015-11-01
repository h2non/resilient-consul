var expect = require('chai').expect
var consul = require('../')

suite('Consul', function () {
  var optionsStub = null

  beforeEach(function () {
    optionsStub = { 
      store: {},
      set: function (key, val) {
        this.store[key] = val
      } 
    }
  })

  test('define params', function () {
    var md = consul({ service: 'test', servers: [] })
    expect(md.type).to.be.equal('discovery')
    md(optionsStub)
    expect(optionsStub.store.servers).to.be.an('array')
    expect(optionsStub.store.service).to.be.empty
  })

  test('missing required params', function () {
    expect(function () {
      consul({ service: 'test' })
    }).to.throw(TypeError)
  })

  test('out middleware', function (done) {
    var md = consul({ service: 'test', servers: ['http://test'], datacenter: 'aws', tag: 'foo' }) 
    var options = {}
    
    md(optionsStub)['out'](options, function (err) {
      expect(err).to.be.undefined
      expect(options.params.dc).to.be.equal('aws')
      expect(options.params.tag).to.be.equal('foo')
      expect(options.params.passing).to.be.undefined
      done()
    })
  })

  test('out middleware using health', function (done) {
    var md = consul({ service: 'test', servers: ['http://test'], datacenter: 'aws', tag: 'foo', onlyHealthy: true }) 
    var options = {}
    
    md(optionsStub)['out'](options, function (err) {
      expect(err).to.be.undefined
      expect(options.params.dc).to.be.equal('aws')
      expect(options.params.tag).to.be.equal('foo')
      expect(options.params.passing).to.be.true
      done()
    })
  })

  test('in middleware', function (done) {
    var md = consul({ service: 'test', servers: ['http://test'], datacenter: 'aws' }) 
    var res = { 
      data: [
        {
          "Node": "test",
          "Address": "10.1.10.12",
          "ServiceName": "web",
          "ServiceAddress": "",
          "ServicePort": 8000,
          "ServiceTags": ["foo"]
        }
      ]
    }
    
    md(optionsStub)['in'](null, res, function (err) {
      expect(err).to.be.undefined
      expect(res.data).to.be.an('array')
      expect(res.data[0]).to.be.equal('http://10.1.10.12:8000')
      done()
    })
  })

  test('in middleware using health', function (done) {
    var md = consul({ service: 'test', servers: ['http://test'], datacenter: 'aws', onlyHealthy: true }) 
    var res = { 
      data: [
        {
          "Node": {
            "Node": "test",
            "Address": "10.1.10.12"
          },
          "Service": {
            "ID": "test:web:8000",
            "Service": "web",
            "Tags": null,
            "Address": "10.1.10.12",
            "Port": 8000
          },
          "Checks": [
            {
              "Node": "test",
              "CheckID": "service:test:web:8000",
              "Name": "Service 'web' check",
              "Status": "passing",
              "Notes": "",
              "Output": "HTTP GET http://10.1.10.12:8000/healthcheck: 200 OK Output: {\"message\":\"ok\"}",
              "ServiceID": "test:web:8000",
              "ServiceName": "web"
            },
            {
              "Node": "test",
              "CheckID": "serfHealth",
              "Name": "Serf Health Status",
              "Status": "passing",
              "Notes": "",
              "Output": "Agent alive and reachable",
              "ServiceID": "",
              "ServiceName": ""
            }
          ]
        }
      ]
    }
    
    md(optionsStub)['in'](null, res, function (err) {
      expect(err).to.be.undefined
      expect(res.data).to.be.an('array')
      expect(res.data[0]).to.be.equal('http://10.1.10.12:8000')
      done()
    })
  })

  test('custom server mapping', function (done) {
    var proxyTag = /^proxy=/
    var md = consul({
      service: 'test',
      servers: ['http://test'],
      datacenter: 'aws',
      mapServers: function (list) {
        return list.map(function (svc) {
          return svc.ServiceTags.filter(proxyTag.test.bind(proxyTag))[0].substring(6)
        })
      }
    }) 
    var res = { 
      data: [
        {
          "Node": "test-1",
          "Address": "10.1.10.12",
          "ServiceName": "web",
          "ServiceAddress": "",
          "ServicePort": 8000,
          "ServiceTags": ["foo", "proxy=https://proxy.com/web/1"]
        }, {
          "Node": "test-2",
          "Address": "10.1.10.13",
          "ServiceName": "web",
          "ServiceAddress": "",
          "ServicePort": 8000,
          "ServiceTags": ["foo", "proxy=https://proxy.com/web/2"]
        }
      ]
    }
    
    md(optionsStub)['in'](null, res, function (err) {
      expect(err).to.be.undefined
      expect(res.data).to.be.an('array')
      expect(res.data.length).to.equal(2)
      expect(res.data[0]).to.be.equal('https://proxy.com/web/1')
      expect(res.data[1]).to.be.equal('https://proxy.com/web/2')
      done()
    })
  })

})