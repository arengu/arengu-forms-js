/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
const helper = require('./webpack.helper.js');
/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */

const babelLoader = helper.defineLoader({
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ]
});

const config = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    https: true,
    port: 8083,
    contentBase: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Playground',
    }),
  ],
  module: {
    rules: [
      babelLoader
    ],
  },
  output: {
    filename: 'forms-development.js',
  },
};

module.exports = merge(common, config);
