import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const distDir = path.resolve(__dirname, '..', 'dist');
const formats = ['cjs', 'esm'] as const;

const runInDist = (format: (typeof formats)[number], body: string): unknown => {
  const load =
    format === 'cjs' ? 'async (specifier) => require(specifier)' : '(specifier) => import(specifier)';
  const script = `const load = ${load};
(async () => {
${body}
})().catch((error) => {
  console.error(error);
  process.exit(1);
});`;
  const args = format === 'cjs' ? ['-e', script] : ['--input-type=module', '-e', script];
  return JSON.parse(execFileSync(process.execPath, args, { cwd: distDir, encoding: 'utf8' }));
};

describe('built package', () => {
  test.each(formats)('the entry loads as %s without touching window, document or navigator', (format) => {
    const touched = runInDist(
      format,
      `const touched = [];
for (const name of ['window', 'document', 'navigator']) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    get: () => {
      touched.push(name);
      return undefined;
    },
  });
}
await load('@sentdm/voice-client-react');
console.log(JSON.stringify(touched));`,
    );

    expect(touched).toEqual([]);
  });

  test('every TypeScript sample in the README compiles against the built package', () => {
    const readme = fs.readFileSync(path.resolve(__dirname, '..', 'README.md'), 'utf8');
    const samples = new Map(
      [...readme.matchAll(/```(tsx?)\n([\s\S]*?)```/g)].map(([, language, code], index) => [
        path.join(distDir, `readme-${index}.${language}`),
        code,
      ]),
    );
    const options = {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      types: ['node'],
      jsx: ts.JsxEmit.ReactJSX,
    };
    const host = ts.createCompilerHost(options);
    const { fileExists, readFile } = host;
    host.fileExists = (fileName) => samples.has(fileName) || fileExists(fileName);
    host.readFile = (fileName) => samples.get(fileName) ?? readFile(fileName);

    const messages = ts
      .getPreEmitDiagnostics(ts.createProgram([...samples.keys()], options, host))
      .map(({ messageText }) => ts.flattenDiagnosticMessageText(messageText, '\n'));

    expect(samples.size).toBeGreaterThan(0);
    expect(messages).toEqual([]);
  });
});
