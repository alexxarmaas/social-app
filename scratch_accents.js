const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.ts') || dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = [
  ...walkSync('./app'),
  ...walkSync('./components'),
  ...walkSync('./prisma'),
];

let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Palabras específicas con 'ñ'
  content = content.replace(/Contraseña/g, 'Clave');
  content = content.replace(/Añadir/g, 'Agregar');
  content = content.replace(/Añade/g, 'Agrega');
  content = content.replace(/añadiremos/g, 'agregaremos');
  content = content.replace(/diseñada/g, 'creada');
  content = content.replace(/diseñado/g, 'creado');
  
  // Acentos (minúsculas)
  content = content.replace(/á/g, 'a');
  content = content.replace(/é/g, 'e');
  content = content.replace(/í/g, 'i');
  content = content.replace(/ó/g, 'o');
  content = content.replace(/ú/g, 'u');
  
  // Acentos (mayúsculas)
  content = content.replace(/Á/g, 'A');
  content = content.replace(/É/g, 'E');
  content = content.replace(/Í/g, 'I');
  content = content.replace(/Ó/g, 'O');
  content = content.replace(/Ú/g, 'U');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    replacedCount++;
  }
});

console.log(`Updated ${replacedCount} files.`);
