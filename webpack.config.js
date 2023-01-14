const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const webpack = require('webpack');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

const del = require('del');

const outputPath = path.resolve(process.cwd(), "build");

del.sync([path.resolve(outputPath, "**/*")]);

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

const miniCssExtractPlugin = new MiniCssExtractPlugin({
  filename: 'static/css/[name].css',
  chunkFilename: 'static/css/[name].css',
});

const cspHtmlWebpackPlugin = new CspHtmlWebpackPlugin({
  'script-src': '',
  'style-src': ["'unsafe-inline'"]},
  {
  hashingMethod: 'sha256',
  hashEnabled: {
    'script-src': true,
    'style-src': true
  },
  nonceEnabled: {
    'script-src': true,
    'style-src': false
}});

const copyWebpackPlugin = new CopyWebpackPlugin({
  patterns: [
    {
      from: 'public',
      globOptions: {
        dot: true,
        gitignore: true,
        ignore: [
          "**/index.html", "**/manifest.json"
        ],
      },
    },
  ],
});

const modify = (buffer) => {
  let manifest = JSON.parse(buffer.toString());
  let package = require('./package.json');

  manifest.version = package.version;

  manifest_JSON = JSON.stringify(manifest, null, 2);
  return manifest_JSON;
};

const copyWebpackPluginManifest = new CopyWebpackPlugin({
  patterns: [{
  from: './public/manifest.json',
  transform (content, path) {
    return modify(content);
  }
}
  ]});

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

  devtool: 'inline-source-map',

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
    extensions: ['.tsx', '.ts', '.js', '.json'],
    fallback: {
      "net": false,
      "tls": false,
    }
  },

  output: {
    pathinfo: false,
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].js',
    path: path.resolve(__dirname, "build")
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
    copyWebpackPluginManifest,
    new webpack.ProvidePlugin({process: "process/browser"}),
    new NodePolyfillPlugin()
  ],
};

const optionsConfig = {
  entry: {
    options: './src/options.tsx',
  },
  watch:true,

  devtool: 'inline-source-map',

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
    extensions: ['.tsx', '.ts', '.js', '.json'],
    fallback: { 
      "net": false,
      "tls": false,
    }
  },

  optimization: {
    minimize: false,
    runtimeChunk: false,
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
    new webpack.ProvidePlugin({process: "process/browser"}),
    new NodePolyfillPlugin()
  ],

};

const serviceWorkerConfig = {
  target: "web",

  devtool: "inline-source-map",

  entry: {
    extension_service_worker: path.join(__dirname, "src", "extension_service_worker.ts"),
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    fallback: { 
      "net": false,
      "tls": false,
    }
  },

  output: {
    path: path.join(__dirname, "build"),
    filename: "extension_service_worker.js",
    globalObject: 'this'
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.service-worker.json'
        }
      }
    ]
  },

  optimization: {
    minimize: false,
    runtimeChunk: false,
  },

  plugins: [new webpack.ProvidePlugin({process: "process/browser"}), new NodePolyfillPlugin()],
};

module.exports = [ appConfig, optionsConfig, serviceWorkerConfig ]
