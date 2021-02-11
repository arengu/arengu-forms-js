/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');

const { version: pkgVersion } = require('./package.json');
/* eslint-enable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */

const DEFAULT_API_URL = 'https://api.arengu.com';

const config = {
  entry: './src/index.ts',
  plugins: [
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(pkgVersion),
      API_URL: JSON.stringify(process.env.API_URL || DEFAULT_API_URL),
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'to-string-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                postcssPresetEnv(),
                cssnano({
                  preset: 'default',
                }),
              ],
            },
          },
        ],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: 'ArenguForms',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
};

module.exports = config;
