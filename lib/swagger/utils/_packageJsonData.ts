import fs from 'fs';
import path from 'path';

const _packageJsonData: Record<string, string> = (() => {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
      const content = fs.readFileSync(pkgPath, 'utf8');
      return JSON.parse(content);
    }
    return {};
  } catch {
    return {};
  }
})();

export default _packageJsonData;
