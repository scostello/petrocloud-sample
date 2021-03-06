'use strict';

// Modules
var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'prod';

module.exports = function makeWebpackConfig () {

    var config = {};

    config.entry = isTest ? {} : {
        app: path.join(__dirname, 'src/app/app.module.js')
    };

    config.output = isTest ? {} : {
        path: path.join(__dirname, '/public'),

        publicPath: 'http://localhost:8080/',

        filename: '[name].bundle.js',

        chunkFilename: '[name].bundle.js'
    };

    if (isTest) {
        config.devtool = 'inline-source-map';
    } else {
        config.devtool = 'eval-source-map';
    }

    // Initialize module
    config.module = {
        preLoaders: [],
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: isTest ? 'null' : ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!postcss-loader')
            },
            {
                test: /\.less/,
                loader: 'style!css!less',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
                loader: 'file?limit=100000'
            },
            {
                test: /\.html$/,
                loader: 'html?' + JSON.stringify({
                    attrs: ['img:src', 'img:ng-src']
                })
            }
        ]
    };

    if (isTest) {
        config.module.preLoaders.push({
            test: /\.js$/,
            exclude: [
                /node_modules/,
                /\.spec\.js$/
            ],
            loader: 'isparta-loader'
        })
    }

    config.postcss = [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ];

    config.plugins = [];

    // Skip rendering index.html in test mode
    if (!isTest) {
        config.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                inject: 'body'
            }),
            new CopyWebpackPlugin([
                {
                    from: 'src/assets/**/*'
                }
            ]),
            new ExtractTextPlugin('[name].[hash].css', {disable: !isProd})
        )
    }

    // Add build specific plugins
    if (isProd) {
        config.plugins.push(
            new webpack.NoErrorsPlugin(),

            new webpack.optimize.DedupePlugin(),

            new webpack.optimize.UglifyJsPlugin(),

            new CopyWebpackPlugin([
                {
                    from: 'src/assets/**/*'
                }
            ])
        )
    }

    config.devServer = {
        contentBase: './src',
        stats: 'minimal'
    };

    return config;
}();
