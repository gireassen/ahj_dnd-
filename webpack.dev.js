const base = require('./webpack.base');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
  devServer: { compress: true, historyApiFallback: true, open: true },
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
