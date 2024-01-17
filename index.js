const pkgUp = require('pkg-up')
const fs = require('fs')
const path = require('path')

const interfaceVersion = 2

function resolve(source, file) {
  if (!source.startsWith('#')) {
    return { found: false }
  }

  const pjsonFpath = pkgUp.sync({ cwd: path.dirname(file) }) || {}
  const pjsonDir = path.dirname(pjsonFpath)
  const { imports = {} } = JSON.parse(fs.readFileSync(pjsonFpath, 'utf8'))

  if (imports[source]) {
    const resolvedPath = path.resolve(pjsonDir, imports[source])
    if (!exists(resolvedPath)) {
      return { found: false }
    }
    return { found: true, path: resolvedPath }
  }

  const importKeys = Object.keys(imports)
    .filter(key => key.includes('*'))
    .map(key => [key, key.slice(0, -1)])
    .filter(([, keyStart]) => source.startsWith(keyStart))

  for (const [key, keyStart] of importKeys) {
    const [pathStart, pathEnd] = imports[key].split('*')
    const pathMiddle = source.slice(keyStart.length)
    const pathFromPjson = pathStart + pathMiddle + pathEnd
    const resolvedPath = path.resolve(pjsonDir, pathFromPjson)

    if (exists(resolvedPath)) {
      return { found: true, path: resolvedPath }
    }
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
