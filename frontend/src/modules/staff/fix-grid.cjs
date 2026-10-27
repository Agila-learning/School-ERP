const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/modules';

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.tsx')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <Grid item xs={...} sm={...} md={...}> with <Grid size={{ xs: ..., sm: ..., md: ... }}>
  // It's easier to just capture the props and convert them.
  content = content.replace(/<Grid item([^>]*?)>/g, (match, props) => {
    let sizeProps = [];
    
    if (props.trim() === '') {
      return '<Grid>';
    }
    
    if (props.trim() === 'xs') {
      return '<Grid size="grow">';
    }
    
    // We might have other props like sx={{...}}
    let otherProps = '';
    
    // Extract xs={..}, sm={..}, md={..}
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
    let hasSize = false;
    
    let newProps = props.replace(/(xs|sm|md|lg|xl)=\{([^}]+)\}/g, (m, key, val) => {
      sizeProps.push(`${key}: ${val}`);
      hasSize = true;
      return ''; // remove from props
    });
    
    // Also check for xs, sm, md without {} (if they are string, though usually numbers)
    newProps = newProps.replace(/(xs|sm|md|lg|xl)="([^"]+)"/g, (m, key, val) => {
      sizeProps.push(`${key}: ${val}`);
      hasSize = true;
      return '';
    });
    
    if (hasSize) {
      return `<Grid size={{ ${sizeProps.join(', ')} }}${newProps}>`;
    } else {
      return `<Grid${newProps}>`;
    }
  });
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed Grid items.');
