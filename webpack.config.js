const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');
const fs = require('fs');

const myPath = {
    scripts: {
        entry: './src/assets/scripts/index.js',
        resolve: 'src/assets/scipts',
        output: './assets/build/app.js'
    },
    styles: {
        entry: './src/assets/styles/main.scss',
        resolve: 'src/assets/styles',
        output: './assets/build/app.css'
    },
    html: {
        entry: './src/html/views',
        resolve: 'src/html/includes',
    },
    dist: 'docs'
}

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
        const parts = item.split('.');
        const name = parts[0];
        const extension = parts[1];
        return new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
            inject: false
        })
    })
}

const htmlPlugins = generateHtmlPlugins(myPath.html.entry);

module.exports = {
    entry: [
        myPath.scripts.entry,
        myPath.styles.entry,
    ],
    output: {
        filename: myPath.scripts.output,
        path: path.resolve(__dirname, myPath.dist)
    },
    devtool: "source-map",
    module: {
        rules: [{
            test: /\.js$/,
            include: path.resolve(__dirname, myPath.scripts.resolve),
            use: { loader: 'babel-loader', options: { presets: 'env' } }
        }, {
            test: /\.(sass|scss)$/,
            include: path.resolve(__dirname, myPath.styles.resolve),
            use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                use: [
                    { loader: "css-loader",     options: { sourceMap: true, minimize: true, url: false } },
                    { loader: "sass-loader",    options: { sourceMap: true } },
                    { loader: "postcss-loader", options: {} }
                ]
            }))
        }, {
            test: /\.twig$/,
            use: ['twig-loader']
        }, {
            test: /\.html$/,
            include: path.resolve(__dirname, myPath.html.resolve),
            use: ['raw-loader']
        }, ]
    },
    plugins: [
        new CleanWebpackPlugin([myPath.dist]),
        new ExtractTextPlugin({filename: myPath.styles.output, allChunks: true}),
        new CopyWebpackPlugin([
            { from: './src/assets/fonts',   to: './assets/fonts' },
            { from: './src/assets/favicon', to: './assets/favicon' },
            { from: './src/assets/images',  to: './assets/images' },
            // { from: './src/assets/uploads', to: './assets/uploads' }
        ]),
        new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i,
            optipng: {
                optimizationLevel: 5
            },
            plugins: [
                imageminMozjpeg({ quality: 90, progressive: true })
              ]
        }),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            server: { baseDir: [myPath.dist] }
          })
    ].concat(htmlPlugins)
};