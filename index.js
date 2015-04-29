
module.exports = function (opts) {
  return {
    type: 'discovery',
    in: function (options, next) {
      next()
    },
    out: function (req, res, next) {
      next()
    }
  }
}
