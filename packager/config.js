var path = require('path')
var webpack = require('webpack')

module.exports = (options) => ({
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:' + options.port,
    'webpack/hot/only-dev-server',
     path.resolve(options.dir, 'node_modules', 'react-dom-chunky', 'app', 'index.js')
  ],

  output: {
    filename: 'chunky.js',
    path: path.resolve(options.dir, 'public'),
    publicPath: '/'
  },

  devtool: 'inline-source-map',

  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      path.resolve(options.dir),
      "node_modules"
    ]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [path.resolve(options.dir, 'node_modules', 'babel-preset-es2015'), {
                modules: false
              }],
              path.resolve(options.dir, 'node_modules', 'babel-preset-react'),
              path.resolve(options.dir, 'node_modules', 'babel-preset-stage-2')
            ],
            plugins: [
              require.resolve('react-hot-loader/babel'),
              [require.resolve('babel-plugin-react-css-modules'), {
                context: path.resolve(options.dir)
              //   filetypes: {
              //     ".scss": "postcss-scss"
              //   }
              }]
            ]
          }
        },
        exclude: /node_modules\/(?!.*chunky.*\/).*/,
      },
      {
        test: /\.css$/,
        // include: path.resolve(__dirname, 'src'),
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: "[name]__[local]___[hash:base64:5]"
            }
          }
          // {
          //   loader: require.resolve('postcss-loader'),
          //   options: {
          //     ident: 'postcss'
          //   }
          // }
        ]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  devServer: {
    host: 'localhost',
    port: options.port,
    contentBase: './public',
    watchContentBase: true,
    historyApiFallback: true,
    hot: true
  }
})
