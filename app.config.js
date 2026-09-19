// Dynamic wrapper around app.json — only exists to let the web publish script
// set a base path: the web build is served from a sub-path of the preview
// server (https://<domain>/web/), so asset URLs need that prefix. Local dev,
// iOS and Android are completely unaffected: without WEB_BASE_PATH set, this
// returns app.json untouched.
module.exports = ({ config }) => {
  const basePath = process.env.WEB_BASE_PATH;
  if (basePath) {
    config.experiments = { ...config.experiments, baseUrl: basePath };
  }
  return config;
};
