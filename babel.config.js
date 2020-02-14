module.exports = api => {
  const babelEnv = api.env();
  const plugins = [];
  //change to 'production' to check if this is working in 'development' mode
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console', {exclude: ['error', 'warn']}]);
    plugins.push([
      'babel-plugin-root-import',
      {
        rootPathPrefix: '~',
        rootPathSuffix: 'src',
      },
    ]);
  } else {
    plugins.push([
      'babel-plugin-root-import',
      {
        rootPathPrefix: '~',
        rootPathSuffix: 'src',
      },
    ]);
  }

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins,
  };
};
