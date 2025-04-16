const base = require('./webpack.base');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
  mode: 'production',
  optimization: { minimize: true, minimizer: [new CssMinimizerPlugin(), new TerserPlugin()] },
});
