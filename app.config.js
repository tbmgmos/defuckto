// Dynamic wrapper around app.json — only exists to let a web build set a
// base path: the build is served from a sub-path, either GitHub Pages
// (/<repo>/, set by deploy-web.yml) or the Mac mini preview server
// (/web/, set by publish-web.sh), so asset URLs need that prefix. Local
// dev, iOS and Android are completely unaffected: without WEB_BASE_PATH
// set, this returns app.json untouched.
module.exports = ({ config }) => {
  const basePath = process.env.WEB_BASE_PATH;
  if (basePath) {
    config.experiments = { ...config.experiments, baseUrl: basePath };
  }
  return config;
};
