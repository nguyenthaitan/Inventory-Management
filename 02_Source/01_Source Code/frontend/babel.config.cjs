module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
    ['@babel/preset-typescript', { allExtensions: true }],
  ],
  plugins: [
    // Enable parsing of import.meta syntax
    '@babel/plugin-syntax-import-meta',
    // Custom plugin: replace import.meta.env with process.env for Jest (CJS) compatibility
    function importMetaEnvTransform() {
      return {
        visitor: {
          MemberExpression(path) {
            // Match import.meta.env -> process.env
            if (
              path.node.object &&
              path.node.object.type === 'MetaProperty' &&
              path.node.object.meta &&
              path.node.object.meta.name === 'import' &&
              path.node.object.property &&
              path.node.object.property.name === 'meta' &&
              path.node.property &&
              path.node.property.name === 'env'
            ) {
              path.replaceWithSourceString('process.env');
            }
          },
        },
      };
    },
  ],
};
