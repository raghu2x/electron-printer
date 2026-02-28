import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleDeclarationsWebpackPlugin } from 'bundle-declarations-webpack-plugin/dist/index.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Main process - ES module output
  {
    mode: 'production',
    target: 'electron-main',
    experiments: {
      outputModule: true,
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    externals: nodeExternals({
      importType: 'module',
    }),
    entry: {
      index: path.resolve(__dirname, 'src/main/index.ts'),
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].js',
      library: {
        type: 'module',
      },
      chunkFormat: 'module',
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new BundleDeclarationsWebpackPlugin({
        entry: {
          filePath: path.resolve(__dirname, 'src/main/index.ts'),
        },
        outFile: 'index.d.ts',
      }),
    ],
  },
  // Renderer - IIFE for browser compatibility
  {
    mode: 'production',
    target: 'web',
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    entry: {
      renderer: path.resolve(__dirname, 'src/renderer/renderer.ts'),
    },
    output: {
      path: path.resolve(__dirname, './dist/renderer'),
      filename: '[name].js',
      library: {
        type: 'umd',
        name: 'renderer',
      },
    },
    optimization: {
      minimize: true,
      minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Print Previews-------',
        template: 'src/renderer/index.html',
      }),
      new MiniCssExtractPlugin({
        filename: '[name].min.css',
      }),
    ],
  },
  // Preload - CommonJS, bundle fs/path
  {
    mode: 'production',
    target: 'electron-preload',
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    externals: {
      electron: 'commonjs electron',
    },
    entry: {
      preload: path.resolve(__dirname, 'src/preload/preload.ts'),
    },
    output: {
      path: path.resolve(__dirname, './dist/preload'),
      filename: '[name].cjs',
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  },
];
