const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: 'static/css/[name].css',
  chunkFilename: 'static/css/[name].css',
});

const cspHtmlWebpackPlugin = new CspHtmlWebpackPlugin();

const copyWebpackPlugin = new CopyWebpackPlugin({
  patterns: [
    {
      from: 'public',
      globOptions: {
        dot: true,
        gitignore: true,
        ignore: [
          "**/index.html"
        ],
      },
    },
  ],
});

const forkTsCheckerWebpackPlugin = new ForkTsCheckerWebpackPlugin({
  eslint: {
      files: "./src/**/*.{ts,tsx,js,jsx}"
  }
});

const htmlPlugin = new HtmlWebpackPlugin({
  inject: true,
  chunks: ['main'],
  template: './public/index.html',
  filename: 'popup.html',
  minify: {
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
  },
});

const optionsHtmlPlugin = new HtmlWebpackPlugin({
  inject: true,
  chunks: ['options'],
  template: './public/index.html',
  filename: 'options.html',
  minify: {
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
  },
});

const appConfig = {
  entry: {
    main: './src/index.tsx',
    content: './src/content.ts',
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: imageInlineSizeLimit,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  output: {
    pathinfo: false,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].js',
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  
  optimization: {
    minimize: false,
    runtimeChunk: false,
  },

  plugins: [
    htmlPlugin,
    cspHtmlWebpackPlugin,
    miniCssExtractPlugin, 
    forkTsCheckerWebpackPlugin, 
    copyWebpackPlugin,
  ],
};

const optionsConfig = {
  entry: {
    options: './src/options.tsx',
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: imageInlineSizeLimit,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  output: {
    pathinfo: false,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].js',
    path: path.resolve(__dirname, "build"),
  },

  plugins: [
    optionsHtmlPlugin,
    cspHtmlWebpackPlugin,
    miniCssExtractPlugin, 
    forkTsCheckerWebpackPlugin,
  ],

};

module.exports = [ appConfig, optionsConfig ]
