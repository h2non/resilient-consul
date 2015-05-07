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

})