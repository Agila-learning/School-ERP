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
models.forEach(m => {
  let content = fs.readFileSync(m, 'utf-8');
  // We need to match mongoose.model<IType>('Name', Schema) and replace it with (mongoose.models.Name || mongoose.model<IType>('Name', Schema)) as any
  let changed = false;
  content = content.replace(/mongoose\.model(?:<([^>]+)>)?\(\s*(['"])([^'"]+)\2\s*,\s*([^)]+)\)/g, (match, type, quote, name, schema) => {
    // If it's already wrapped, ignore
    if (match.includes('mongoose.models')) return match;
    changed = true;
    const typeStr = type ? `<${type}>` : '';
    return `(mongoose.models['${name}'] || mongoose.model${typeStr}('${name}', ${schema})) as any`;
  });
  
  if (changed) {
    fs.writeFileSync(m, content, 'utf-8');
    console.log('Fixed:', m);
  }
});
