module.exports = {
  devServer: {
    port: 5174,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: "@import '~@/styles/element-variables.scss';"
      }
    }
  }
};
