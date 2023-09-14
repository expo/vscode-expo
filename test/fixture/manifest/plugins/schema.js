// A no-op to test valid local plugins
module.exports = (config) => config;

// This one also includes a schema definition for autocomplete and validation
module.exports.schema = {
  description: "A plugin created by XCorp and does something",
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      description: "The name that will be written somewhere in the Expo.plist. Learn more: https://docs.expo.dev",
      markdownDescription: "The name that will be written somewhere in the **Expo.plist**. [Learn more](https://docs.expo.dev)",
    },
    enableFeature: {
      type: 'boolean',
      description: "Enable some experimental feature",
      markdownDescription: "Enable some _experimental_ feature",
    },
  },
};
