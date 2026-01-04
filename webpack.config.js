const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env = {}) => {
  const isProd = env.production || process.env.NODE_ENV === 'production';
  const analyze = env.analyze === 'true';
  
  return {
    mode: isProd ? 'production' : 'development',
    entry: {
      // Main application bundle - complete experience
      main: './js/index.js',

      // Critical path bundle - essential for initial rendering
      critical: './js/critical.js',

      // CSS entry points
      styles: './css-styles/main.css'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProd ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      clean: true,
      // Use relative paths for GitHub Pages compatibility
      publicPath: './',
    },
    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      usedExports: true, // Enable tree shaking
      sideEffects: true, // Respect package.json sideEffects
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 20,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
          },
          // Separate bundle for chart libraries which are large
          charts: {
            test: /[\\/]js[\\/]components[\\/]charts[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Separate bundle for map components
          maps: {
            test: /[\\/]js[\\/]map[\\/]/,
            name: 'maps',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Common code shared across components
          common: {
            name: 'common',
            minChunks: 2,
            priority: -20,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      },
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProd,
              drop_debugger: isProd,
              pure_funcs: isProd ? ['console.log', 'console.debug', 'console.info'] : [],
            },
            mangle: isProd,
            output: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }),
      ],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  useBuiltIns: 'usage',
                  corejs: 3,
                  modules: false, // Important for tree shaking
                  targets: {
                    browsers: [
                      'last 2 versions',
                      'not dead',
                      '> 0.5%',
                      'not ie 11'
                    ]
                  }
                }]
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator'
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: false,
              }
            },
            'postcss-loader'
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: 'body',
        minify: isProd ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
        // Exclude inline scripts that should remain in the template
        excludeChunks: ['critical'],
      }),
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[contenthash].css' : '[name].css',
        chunkFilename: isProd ? '[name].[contenthash].chunk.css' : '[name].chunk.css',
      }),
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
      }),
      ...(isProd ? [
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240, // Only process files > 10kb
          minRatio: 0.8,
        }),
      ] : []),
      ...(analyze ? [new BundleAnalyzerPlugin()] : []),
    ],
    devtool: isProd ? 'source-map' : 'eval-source-map',
    stats: {
      modules: false,
      children: false,
      chunks: false,
    },
    performance: {
      hints: isProd ? 'warning' : false,
      maxAssetSize: 512000, // 500KB
      maxEntrypointSize: 512000, // 500KB
    },
  };
}; 