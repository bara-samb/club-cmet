const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.html')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
}

walk('src', function(err, results) {
  if (err) throw err;
  results.push(path.resolve('index.html'));
  results.push(path.resolve('tailwind.config.js'));
  
  results.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Remplacements HEX exacts
    content = content.replace(/#0f213a/gi, '#003058');
    content = content.replace(/#1e3a5f/gi, '#002850');
    content = content.replace(/#22c55e/gi, '#187840');
    content = content.replace(/#16a34a/gi, '#125e31'); // pour btn-primary:hover
    
    // Remplacements Tailwind Gris vers Gris clair / Gris ombre
    content = content.replace(/bg-slate-50/g, 'bg-[#F8F0F0]');
    content = content.replace(/bg-gray-50/g, 'bg-[#F8F0F0]');
    content = content.replace(/bg-red-50/g, 'bg-red-50'); // exclusion si besoin, mais bg-red-50 ne matche pas
    
    content = content.replace(/border-slate-200/g, 'border-[#C8C8C8]');
    content = content.replace(/border-gray-200/g, 'border-[#C8C8C8]');
    
    // Remplacement spécifique pour le CSS (rgba et box-shadows)
    // rgba(34,197,94 -> (24,120,64) (Vert MET)
    content = content.replace(/34\s*,\s*197\s*,\s*94/g, '24,120,64');
    // rgba(15,33,58 -> (0,48,88) (Bleu MET)
    content = content.replace(/15\s*,\s*33\s*,\s*58/g, '0,48,88');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  });
});
