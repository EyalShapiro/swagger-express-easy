import path from 'path';

const _packageJsonData: Record<string, any> = (() => {
  try {
    return require(path.join(process.cwd(), 'package.json'));
  } catch {
    return {};
  }
})();

export default _packageJsonData;
