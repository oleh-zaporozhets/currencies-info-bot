import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import { Configuration } from 'webpack';

type NODE_ENV = 'production' | 'development';

const config: Configuration = {
  mode: process.env.NODE_ENV as NODE_ENV,
  target: 'node',
  context: path.join(__dirname, 'src'),
  entry: './index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: 'build',
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{ test: /\.ts?$/, loader: 'ts-loader' }],
  },
  externals: [nodeExternals()],
};

export default config;
