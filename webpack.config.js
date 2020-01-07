//const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = [{
  bail: true,
  entry: {
    TETRADGrapher: ['./src/js/TETRADGrapher.js']
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: '[name].bundle.js',
    publicPath: ''
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.gif$/,
        loader: 'url-loader'
      },
      /*{
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
        },*/
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"//,
          //"postcss-loader"
        ]
      },
      {
        test: /\.(scss)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [ require('autoprefixer') ];
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: '../docs/index.html',
      inject: 'head',
      inlineSource: '.(js|css)$',
      template: 'src/html/TETRADGrapher.html'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
}]
