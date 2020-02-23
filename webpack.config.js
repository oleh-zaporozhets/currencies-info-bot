const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'none',
  target: 'node',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: 'build',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{ test: /\.ts?$/, loader: 'ts-loader' }],
  },
};
