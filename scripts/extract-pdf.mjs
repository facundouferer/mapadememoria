import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(process.cwd());
const pdfPath = resolve(ROOT, 'docs/ruvte2022_anm_nomina_ccd_con_mapas_de_zonas_mayo_2022.pdf');
const outputPath = resolve(ROOT, 'src/data/raw/ruvte-pages.json');

const pythonScript = `
from pathlib import Path
import json
import sys

from pypdf import PdfReader

pdf = Path(sys.argv[1])
reader = PdfReader(str(pdf))
pages = []
for index, page in enumerate(reader.pages, start=1):
    text = page.extract_text() or ''
    pages.append({
        'page': index,
        'text': text,
    })

print(json.dumps({
    'document': pdf.name,
    'page_count': len(pages),
    'pages': pages,
}, ensure_ascii=False))
`;

const result = spawnSync('python3', ['-c', pythonScript, pdfPath], {
  encoding: 'utf8',
});

if (result.status !== 0) {
  const stderr = result.stderr?.trim() || 'No se pudo extraer el PDF.';
  throw new Error(stderr);
}

await mkdir(resolve(ROOT, 'src/data/raw'), { recursive: true });
await writeFile(outputPath, result.stdout, 'utf8');

console.log(`PDF extraido en ${outputPath}`);
