const pkgJson = require(process.env['PKG_JSON_PATH'] || '../../package.json');

function processExportMap(m) {
  for (const key in m) {
    const value = m[key];
    if (typeof value === 'string') m[key] = value.replace(/^\.\/dist\//, './');
    else processExportMap(value);
  }
}
processExportMap(pkgJson.exports);

for (const key of ['types', 'main', 'module']) {
  if (typeof pkgJson[key] === 'string') pkgJson[key] = pkgJson[key].replace(/^(\.\/)?dist\//, './');
}

// Published manifests can't carry pnpm's workspace: protocol. A workspace dependency is pinned to that
// package's exact version, because the packages release together.
const path = require('path');
const fs = require('fs');
const packagesDir = path.resolve(__dirname, '..', '..', 'packages');
const workspaceVersions = Object.fromEntries(
  fs.readdirSync(packagesDir).map((dir) => {
    const { name, version } = require(path.join(packagesDir, dir, 'package.json'));
    return [name, version];
  }),
);
for (const field of ['dependencies', 'peerDependencies']) {
  for (const [name, range] of Object.entries(pkgJson[field] || {})) {
    if (typeof range !== 'string' || !range.startsWith('workspace:')) continue;
    if (!workspaceVersions[name]) throw new Error(`${name} is not a package in ${packagesDir}`);
    pkgJson[field][name] = workspaceVersions[name];
  }
}

delete pkgJson.devDependencies;
if (pkgJson.scripts) {
  delete pkgJson.scripts.prepack;
  delete pkgJson.scripts.prepublishOnly;
  delete pkgJson.scripts.prepare;
}

console.log(JSON.stringify(pkgJson, null, 2));
