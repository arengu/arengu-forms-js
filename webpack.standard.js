/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
const { merge } = require('webpack-merge');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const common = require('./webpack.common.js');
const helper = require('./webpack.helper.js');
/* eslint-enable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */

const babelLoader = helper.defineLoader({
  presets: [
    [
      '@babel/preset-env',
      {
        debug: true,
        modules: false,
        targets: {
          browsers: [
            'chrome >= 55',
            'firefox >= 53',
            'safari >= 11',
            'ios >= 11',
            'edge >= 17', // minimum version for URLSearchParams
            'opera >= 42',
          ],
        },
      },
    ],
  ],
});

const config = {
  mode: 'production',
  plugins: [
    new BundleAnalyzerPlugin({
      reportFilename: 'report-standard.html',
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],
  module: {
    rules: [
      babelLoader,
    ],
  },
  output: {
    filename: 'forms-standard.js',
  },
};

module.exports = merge(common, config);
