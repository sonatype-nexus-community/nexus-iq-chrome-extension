const path = require("path");
const webpack = require("webpack");
const GlobEntriesPlugin = require("webpack-watched-glob-entries-plugin");
module.exports = {
  webpack: (config, { dev, vendor }) => {
    const envName = dev ? "development" : "production";
    return {
      mode: envName,
      devtool: dev ? "eval" : "source-maps",
      entry: GlobEntriesPlugin.getEntries([
        path.resolve("src", "*.{js,mjs,jsx,ts}"),
        path.resolve("src", "?(scripts)/*.{js,mjs,jsx,ts}"),
      ]),
      module: {
        rules: [
          {
            enforce: "pre",
            test: /\.js$/,
            use: ["source-map-loader"],
          },
          {
            test: /\.ts$/,
            exclude: path.resolve("src", "./scripts/lib"),
            use: [
              {
                loader: "ts-loader",
              },
            ],
          },
        ],
      },
      resolve: {
        extensions: [".tsx", ".ts", ".js"],
      },
      optimization: {
        splitChunks: {
          name: "scripts/vendor",
          chunks: "initial"
        }
      },
      output: { chunkFilename: "[name].js" },
      //jquery
      plugins: [
        new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery",
          "window.jQuery": "jquery'",
          "window.$": "jquery",
        }),
      ],
    };
  },
};
