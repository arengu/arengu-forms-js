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
            'chrome >= 40',
            'firefox >= 40',
            'safari >= 10',
            'ios >= 10',
            'edge >= 13',
            'opera >= 33',
            'ie 11',
          ],
        },
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
      },
    ],
  ],
});

const config = {
  entry: './src/legacy.ts',
  mode: 'production',
  plugins: [
    new BundleAnalyzerPlugin({
      reportFilename: 'report-legacy.html',
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
    filename: 'forms-legacy.js',
  },
};

module.exports = merge(common, config);
