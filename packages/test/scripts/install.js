const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const glob = require('glob');

const moduleRoot = path.resolve(__dirname, '..');
const package = JSON.parse(fs.readFileSync(path.resolve(moduleRoot, 'package.json')));
const artifactDir = path.resolve(moduleRoot, '.artifacts');

if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, 0744);
}

Object.keys(package.peerDependencies).forEach((dependency) => {
    const artifactPath = path.resolve(__dirname, dependency.replace('@skimp/', '../../../modules/'));

    cp.execSync(`npm install`, { cwd: artifactPath, stdio: 'inherit' });
    cp.execSync(`npm run build`, { cwd: artifactPath, stdio: 'inherit' });
    cp.execSync(`npm pack "${artifactPath}"`, { cwd: artifactDir, stdio: 'inherit' });
});

glob('*.tgz', { cwd: artifactDir }, (err, files) => {
    cp.execSync(`npm install "${files.map((file) => path.resolve(artifactDir, file)).join('" "')}" --no-save`, { cwd: moduleRoot, stdio: 'inherit' });
});
