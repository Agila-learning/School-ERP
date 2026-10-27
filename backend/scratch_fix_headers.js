const fs = require('fs');
const glob = require('glob');

const files = glob.sync('c:/Users/agila/OneDrive/Documents/School-ERP_FIC/backend/src/modules/**/*.ts');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Replace req.headers['...'] with (req.headers['...'] as string) where it's being assigned to a string or passed to a function
  // Actually, wait, let's just do a regex replace for the specific lines that failed, or just blindly replace req.headers['x-academic-year-id'] with (req.headers['x-academic-year-id'] as string)
  
  // A safer regex:
  // req.headers['x-academic-year-id'] -> (req.headers['x-academic-year-id'] as string | undefined) is sometimes used, but if the function expects string, it will still fail if undefined is not handled.
  // The error says "string | string[] is not assignable to string".
  // Which means the code is doing something like: const academicYearId: string = req.headers['x-academic-year-id'];
  
  const regex = /req\.headers\['x-academic-year-id'\]/g;
  if (content.match(regex)) {
    // just replacing it with (req.headers['x-academic-year-id'] as string)
    // Wait, if it's already cast like `req.headers['x-academic-year-id'] as string` this will make it `(req.headers['x-academic-year-id'] as string) as string` which is fine.
    
    // Instead of risking bad syntax, let's just use the exact error lines if we want.
    // Let's just fix it globally.
    content = content.replace(/req\.headers\['x-academic-year-id'\](?!\s*as)/g, "(req.headers['x-academic-year-id'] as string)");
    content = content.replace(/req\.headers\['x-branch-id'\](?!\s*as)/g, "(req.headers['x-branch-id'] as string)");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
}
