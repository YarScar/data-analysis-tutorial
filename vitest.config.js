module.exports = {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['test/setup.js'],
    include: ['test/**/__tests__/**/*.test.js', 'test/**/*.spec.js']
  }
}
