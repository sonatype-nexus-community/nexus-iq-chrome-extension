const path = require("path");
const GlobEntriesPlugin = require("webpack-watched-glob-entries-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
// const ProvidePlugin = require("webpack-provide-plugin");

module.exports = {
  webpack: (config, { dev, vendor }) => {
    const envName = dev ? "development" : "production";
    config.devtool = "eval";
    config.module = config.module || { rules: [] };
    config.module.rules.push({
      enforce: "pre",
      test: /\.js$/,
      use: ["source-map-loader"],
    });
    config.resolve.extensions.push(".ts");
    config.resolve.extensions.push(".tsx");
    config.entry = GlobEntriesPlugin.getEntries([
      path.resolve("src", "*.{js,mjs,jsx,ts,tsx}"),
      path.resolve("src", "?(scripts)/*.{js,mjs,jsx,ts,tsx}"),
    ]);
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: path.resolve("src", "./scripts/lib"),
      use: [
        {
          loader: "ts-loader",
        },
      ],
    });
    config.optimization.splitChunks = {
      name: "scripts/vendor",
      chunks: "initial",
    };
    config.output.chunkFilename = "[name].js";
    // Disable minimize for vendor review
    config.optimization.minimize = false;

    return config;
  },
  copyIgnore: ["**/*.ts", "**/*.json", "**/*.tsx"],
};
