import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const rootDir = process.cwd();

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    let resolvedPath = path.join(rootDir, 'src', specifier.slice(2));
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
      if (fs.existsSync(path.join(resolvedPath, 'index.js'))) {
        resolvedPath = path.join(resolvedPath, 'index.js');
      } else if (fs.existsSync(path.join(resolvedPath, 'index.jsx'))) {
        resolvedPath = path.join(resolvedPath, 'index.jsx');
      }
    } else if (!fs.existsSync(resolvedPath)) {
      if (fs.existsSync(resolvedPath + '.js')) {
        resolvedPath = resolvedPath + '.js';
      } else if (fs.existsSync(resolvedPath + '.jsx')) {
        resolvedPath = resolvedPath + '.jsx';
      }
    }
    return nextResolve(pathToFileURL(resolvedPath).href, context);
  }

  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
    try {
      const parentPath = new URL(context.parentURL).pathname.replace(/^\/([A-Z]:)/i, '$1');
      const parentDir = path.dirname(parentPath);
      const candidate = path.resolve(parentDir, specifier);
      if (!fs.existsSync(candidate)) {
        if (fs.existsSync(candidate + '.js')) {
          return nextResolve(pathToFileURL(candidate + '.js').href, context);
        } else if (fs.existsSync(candidate + '.jsx')) {
          return nextResolve(pathToFileURL(candidate + '.jsx').href, context);
        }
      }
    } catch {
      // fallback to nextResolve
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.includes('/src/')) {
    const raw = await nextLoad(url, context);
    let source = raw.source.toString();
    // Polyfill import.meta.env for Node.js if present
    if (source.includes('import.meta.env')) {
      source = `if (!import.meta.env) import.meta.env = { VITE_API_MODE: 'mock' };\n` + source;
    }
    return {
      format: raw.format || 'module',
      source,
      shortCircuit: true,
    };
  }
  return nextLoad(url, context);
}
