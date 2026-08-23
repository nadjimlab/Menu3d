import { mkdir, copyFile } from 'node:fs/promises';

const routes = ['admin', 's/maison-du-delice', 's/atelier-nova', 's/form-studio'];

for (const route of routes) {
  const destination = `dist/${route}/index.html`;
  await mkdir(destination.slice(0, destination.lastIndexOf('/')), { recursive: true });
  await copyFile('dist/index.html', destination);
  console.log(`Created ${destination}`);
}
