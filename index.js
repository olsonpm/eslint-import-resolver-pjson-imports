const pkgUp = require('pkg-up')
const fs = require('fs')
const path = require('path')

const interfaceVersion = 2

function resolve(source, file) {
  if (!source.startsWith('#')) return { found: false }

  const pjsonFpath = pkgUp.sync({ cwd: path.dirname(file) }) || {}
  const pjsonDir = path.dirname(pjsonFpath)
  const { imports = {} } = JSON.parse(fs.readFileSync(pjsonFpath, 'utf8'))

  if (imports[source]) {
    const resolvedPath = path.resolve(pjsonDir, imports[source])
    if (!exists(resolvedPath)) return { found: false }
    return { found: true, path: resolvedPath }
  }

  const importKeys = Object.keys(imports)
    .filter(key => key.endsWith('*'))
    .map(key => key.slice(0, -1))
    .filter(keyWithoutAsterisk => source.startsWith(keyWithoutAsterisk))

  for (const key of importKeys) {
    const replaceVal = source.slice(key.length)
    const aliasValue = imports[key + '*']
    const pathFromPjson = aliasValue.replace('*', replaceVal)
    const resolvedPath = path.resolve(pjsonDir, pathFromPjson)

    if (exists(resolvedPath)) return { found: true, path: resolvedPath }
  }

  return { found: false }
}

function exists(itemPath) {
  try {
    fs.accessSync(itemPath)
    return true
  } catch (_err) {
    return false
  }
}

module.exports = { interfaceVersion, resolve }
