// Dynamic wrapper around app.json — only exists to let CI set a base path
// for the GitHub Pages web export (a project site is served from
// /<repo>/, so asset URLs need that prefix). Local dev, iOS and Android
// are completely unaffected: without GH_PAGES_BASE_PATH set, this returns
// app.json untouched.
module.exports = ({ config }) => {
  const basePath = process.env.GH_PAGES_BASE_PATH;
  if (basePath) {
    config.experiments = { ...config.experiments, baseUrl: basePath };
  }
  return config;
};
