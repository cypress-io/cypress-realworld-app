module.exports = (on, config) => {
  process.env.NODE_ENV = 'development'
  require('@cypress/react/plugins/react-scripts')(on, config)
  return config
}