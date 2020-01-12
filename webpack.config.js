const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    contentBase: './dist',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new HtmlPlugin({
      title: 'Stuga 2020',
      template: './src/index.html',
    }),
    new CopyPlugin([{ from: './assets' }, { from: './stuga/stuga.bas' }]),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
