// Bundles the calling provider's library into the built package, so apps install no provider package.
// Runs from scripts/utils/build-package after tsc, in the package directory. It replaces the compiled
// shim dist/adapter/sinch-rtc.{js,mjs}, which re-exports from sinch-rtc, with sinch-rtc and its own
// dependencies bundled in, and writes the notices their licences ask for to dist/THIRD_PARTY_NOTICES.md.
// pubnub stays a dependency of the package: its licence allows redistributing it only unmodified.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const shim = path.resolve('dist', 'adapter', 'sinch-rtc');

const options = {
  entryPoints: ['src/adapter/sinch-rtc.ts'],
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  external: ['pubnub'],
  minify: true,
  legalComments: 'eof',
  logLevel: 'warning',
};

// In ESM, esbuild would leave sinch-rtc's require("pubnub") as a shim that throws outside Node ("Dynamic
// require ... is not supported"). There, each require is answered with the PubNub class from one static
// import of pubnub, which bundlers and browsers follow.
const pubnubRequire = {
  name: 'pubnub-require',
  setup(builder) {
    builder.onResolve({ filter: /^pubnub$/ }, ({ kind }) =>
      kind === 'require-call' ? { path: 'pubnub', namespace: 'pubnub-require' } : undefined,
    );
    builder.onLoad({ filter: /.*/, namespace: 'pubnub-require' }, () => ({
      contents: 'module.exports = __pubnub;',
    }));
  },
};

const { metafile } = await build({
  ...options,
  format: 'esm',
  outfile: `${shim}.mjs`,
  metafile: true,
  banner: { js: 'import __pubnub from "pubnub";' },
  plugins: [pubnubRequire],
});
await build({ ...options, format: 'cjs', outfile: `${shim}.js` });

// tsc's declarations and maps describe the shim, not the bundle, and nothing imports its types.
for (const file of fs.readdirSync(path.dirname(shim))) {
  const full = path.join(path.dirname(shim), file);
  if (full.startsWith(`${shim}.`) && full !== `${shim}.js` && full !== `${shim}.mjs`) fs.rmSync(full);
}

const packages = new Map();
for (const input of Object.keys(metafile.inputs)) {
  const dir = input.match(/^.*node_modules\/(?:@[^/]+\/)?[^/]+/)?.[0];
  if (!dir || packages.has(dir)) continue;
  const { name, version, license } = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  if (typeof license !== 'string') throw new Error(`${name} declares no licence, so it cannot be bundled`);
  const file = fs.readdirSync(dir).find((f) => /^(licen[sc]e|copying)(\.(md|txt))?$/i.test(f));
  const text = file ? fs.readFileSync(path.join(dir, file), 'utf8').trim() : undefined;
  packages.set(dir, { name, version, license, text });
}

const notices = [...packages.values()]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(
    ({ name, version, license, text }) =>
      `## ${name} ${version}\n\nLicence: ${license}\n\n` +
      (text ? `\`\`\`\n${text}\n\`\`\`\n` : 'The package ships no licence file.\n'),
  );

fs.writeFileSync(
  path.resolve('dist', 'THIRD_PARTY_NOTICES.md'),
  '# Third-party notices\n\n' +
    'This package bundles the following packages into `adapter/sinch-rtc.js` and `adapter/sinch-rtc.mjs`, ' +
    'each under its own licence. `pubnub`, which they use, is not bundled: it is a dependency of this package.\n\n' +
    notices.join('\n'),
);

console.error(`bundled ${packages.size} packages into ${path.relative(process.cwd(), shim)}.{js,mjs}`);
