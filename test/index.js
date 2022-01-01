const { expect } = require('chai')
const { resolve } = require('../index.js')
const path = require('path')

const expectedPath = {
  nonWildcard: path.resolve(__dirname, 'project/src/non-wildcard.js'),
  wildcard: path.resolve(__dirname, 'project/src/wildcard/parent/child.js'),
}

const importerPath = path.resolve(__dirname, 'project/src/importer.js')

describe('package.json imports resolver', () => {
  it('resolves a non-wildcard import', () => {
    const { found, path } = resolve('#non-wildcard', importerPath)

    expect(found).to.be.true
    expect(path).to.equal(expectedPath.nonWildcard)
  })
  it('does not resolve a non-existent non-wildcard import', () => {
    const { found } = resolve('#non-wildcard_doesnt-exist', importerPath)

    expect(found).to.be.false
  })

  it('resolves a wildcard import', () => {
    const { found, path } = resolve('#wildcard/child', importerPath)

    expect(found).to.be.true
    expect(path).to.equal(expectedPath.wildcard)
  })
  it('does not resolve a non-existent non-wildcard import', () => {
    const { found } = resolve('#wildcard_doesnt-exist/child', importerPath)

    expect(found).to.be.false
  })
})
