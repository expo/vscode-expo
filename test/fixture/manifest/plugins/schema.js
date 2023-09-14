// A no-op to test valid local plugins
module.exports = (config) => config;

// This one also includes a schema definition for autocomplete and validation
module.exports.schema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
    enableFeature: { type: 'boolean' },
  },
};
