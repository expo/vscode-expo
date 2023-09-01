const execa = require('execa');
const { major } = require('semver');

/** Find the major SDK version from the `expo` package. */
async function resolveExpoVersion(tagOrVersion = 'latest') {
  let stdout = '';

  try {
    ({ stdout } = await execa('npm', ['info', `expo@${tagOrVersion}`, '--json', 'version']));
  } catch (error) {
    throw new Error(`Could not resolve expo@${tagOrVersion}, reason:\n${error.message || error}`);
  }

  // thanks npm, for returning a "" json string value for invalid versions
  if (!stdout) {
    throw new Error(`Could not resolve expo@${tagOrVersion}, reason:\nInvalid version`);
  }

  // thanks npm, for returning a "x.x.x" json value...
  if (stdout.startsWith('"')) {
    stdout = `[${stdout}]`;
  }

  return major(JSON.parse(stdout).at(-1));
}

/** Download the latest XDL schema by major Expo SDK version. */
async function resolveExpoSchema(sdkVersion) {
  return fetch(`https://exp.host/--/api/v2/project/configuration/schema/${sdkVersion}.0.0`)
    .then((response) => response.json())
    .then((json) => json.data.schema);
}

module.exports = {
  resolveExpoSchema,
  resolveExpoVersion,
};
