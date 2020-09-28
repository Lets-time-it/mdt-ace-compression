module.exports = {
  presets: [['@babel/preset-env', {
    targets: {
      node: 'current',
    },
  }],
  '@babel/preset-typescript'],
  plugins: ['babel-plugin-add-module-exports'],
  /* exclude: [
      // /node_modules\/uuid/,
      /node_modules\/@babel/,
      /node_modules\/@hapi/
    ],
    ignore: [
      // /node_modules\/uuid/,
      // /node_modules\/@hapi/
    ], */
  // exclude: /node_modules/,
  //    "exclude": 'node_modules/**',
  env: {
    rollup: {
      plugins: [
        'babel-plugin-add-module-exports',
        ['@babel/plugin-transform-runtime', {
          regenerator: true,
        }],
      ],
    },
    test: {
      plugins: ['@babel/plugin-transform-runtime'],
    },
  },
};
