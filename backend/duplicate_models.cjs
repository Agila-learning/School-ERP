const fs = require('fs');
const path = require('path');

function findModels(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findModels(filePath, fileList);
    } else if (file.endsWith('.model.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const models = findModels('./src');
const names = {};
models.forEach(m => {
  const content = fs.readFileSync(m, 'utf-8');
  // Handle mongoose.model<IType>('Name', Schema) or mongoose.model('Name', Schema)
  const match = content.match(/mongoose\.model\s*(?:<\s*[^>]+\s*>\s*)?\(\s*['"]([^'"]+)['"]/);
  if (match) {
    const name = match[1];
    if (names[name]) {
      console.log('DUPLICATE:', name, 'in', m, 'and', names[name]);
    } else {
      names[name] = m;
    }
  }
});
