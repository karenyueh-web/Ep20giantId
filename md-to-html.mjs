// md-to-html.mjs — 將 MD 檔轉為精美 HTML（使用 createRequire）
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { execSync } from 'child_process';

// Install marked if not available
try {
  createRequire(import.meta.url)('marked');
} catch {
  console.log('Installing marked...');
  execSync('npm install --no-save marked', { stdio: 'inherit' });
}

const { marked } = createRequire(import.meta.url)('marked');

const HTML_TEMPLATE = (title, body) => `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1117;
    --surface: #161b22;
    --surface2: #1c2333;
    --border: #30363d;
    --border-light: #3d444d;
    --text: #e6edf3;
    --text-secondary: #8b949e;
    --text-muted: #6e7681;
    --accent: #58a6ff;
    --accent-hover: #79c0ff;
    --green: #3fb950;
    --red: #f85149;
    --yellow: #d29922;
    --purple: #bc8cff;
    --code-bg: #0d1117;
    --table-stripe: rgba(110,118,129,0.04);
    --table-hover: rgba(88,166,255,0.06);
    --shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2);
    --shadow-lg: 0 4px 16px rgba(0,0,0,0.4), 0 12px 40px rgba(0,0,0,0.3);
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans TC', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
    font-size: 15px;
    -webkit-font-smoothing: antialiased;
  }

  .wrapper {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 32px 80px;
  }

  h1 {
    font-size: 2em;
    font-weight: 700;
    margin: 48px 0 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid;
    border-image: linear-gradient(135deg, #58a6ff 0%, #bc8cff 100%) 1;
    letter-spacing: -0.02em;
    line-height: 1.3;
  }
  h1:first-child { margin-top: 0; }

  h2 {
    font-size: 1.5em;
    font-weight: 650;
    margin: 40px 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
    color: var(--accent);
    letter-spacing: -0.01em;
  }

  h3 {
    font-size: 1.2em;
    font-weight: 600;
    margin: 28px 0 8px;
    color: var(--text);
  }

  h4 {
    font-size: 1.05em;
    font-weight: 600;
    margin: 20px 0 6px;
    color: var(--text-secondary);
  }

  p { margin: 8px 0 12px; }

  a {
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  a:hover { color: var(--accent-hover); border-bottom-color: var(--accent-hover); }

  strong { color: #fff; font-weight: 600; }
  em { color: var(--text-secondary); }

  hr { border: none; height: 1px; background: var(--border); margin: 32px 0; }

  ul, ol { padding-left: 24px; margin: 8px 0 12px; }
  li { margin: 3px 0; line-height: 1.65; }
  li > ul, li > ol { margin: 2px 0 4px; }

  blockquote {
    border-left: 3px solid var(--accent);
    background: var(--surface);
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 0 8px 8px 0;
    color: var(--text-secondary);
    font-size: 0.95em;
  }
  blockquote p { margin: 4px 0; }

  code {
    font-family: 'Cascadia Code', 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace;
    font-size: 0.88em;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 2px 7px;
    border-radius: 6px;
    color: var(--accent);
  }

  pre {
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
    overflow-x: auto;
    margin: 12px 0 16px;
    box-shadow: var(--shadow);
  }
  pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.87em;
    color: var(--text);
    line-height: 1.55;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 12px 0 20px;
    font-size: 0.9em;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  thead { background: var(--surface2); }
  thead th {
    font-weight: 600;
    color: var(--text);
    text-align: left;
    padding: 10px 14px;
    border-bottom: 2px solid var(--border);
    white-space: nowrap;
    font-size: 0.92em;
  }

  tbody tr { transition: background 0.15s; }
  tbody tr:nth-child(even) { background: var(--table-stripe); }
  tbody tr:hover { background: var(--table-hover); }

  td {
    padding: 8px 14px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
    line-height: 1.5;
  }
  tbody tr:last-child td { border-bottom: none; }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--border-light); }

  .mermaid {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    margin: 16px 0;
    text-align: center;
    overflow-x: auto;
  }

  .back-top {
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 44px;
    height: 44px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--accent);
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s, box-shadow 0.3s;
    transform: translateY(8px);
    box-shadow: var(--shadow);
    z-index: 999;
  }
  .back-top.visible { opacity: 1; transform: translateY(0); }
  .back-top:hover { background: var(--surface2); box-shadow: var(--shadow-lg); }

  @media (min-width: 1280px) {
    .wrapper { margin-left: 280px; }
    .toc-sidebar {
      position: fixed; top: 0; left: 0; width: 260px; height: 100vh;
      overflow-y: auto; background: var(--surface); border-right: 1px solid var(--border);
      padding: 24px 16px; font-size: 0.82em; z-index: 100;
    }
    .toc-sidebar h3 {
      font-size: 0.9em; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;
    }
    .toc-sidebar ul { list-style: none; padding: 0; }
    .toc-sidebar li { margin: 2px 0; }
    .toc-sidebar a {
      display: block; padding: 4px 8px; border-radius: 6px;
      color: var(--text-secondary); border-bottom: none;
      transition: background 0.15s, color 0.15s;
    }
    .toc-sidebar a:hover { background: var(--table-hover); color: var(--accent); }
    .toc-sidebar .toc-h3 { padding-left: 20px; font-size: 0.95em; }
  }
  @media (max-width: 1279px) { .toc-sidebar { display: none; } }

  @media print {
    body { background: #fff; color: #1a1a1a; font-size: 11pt; }
    .wrapper { max-width: 100%; padding: 0; }
    .toc-sidebar, .back-top { display: none !important; }
    h1, h2, h3 { color: #1a1a1a; break-after: avoid; }
    h2 { border-bottom-color: #ccc; color: #1a1a1a; }
    table { box-shadow: none; border-color: #ccc; font-size: 9pt; }
    thead { background: #f0f0f0; }
    thead th { color: #1a1a1a; border-bottom-color: #999; }
    td { border-bottom-color: #ddd; }
    pre { background: #f6f6f6; border-color: #ddd; box-shadow: none; }
    code { background: #f0f0f0; border-color: #ddd; color: #0550ae; }
    blockquote { background: #f6f8fa; border-left-color: #0550ae; }
    a { color: #0550ae; }
  }
</style>
</head>
<body>

<div class="wrapper">
${body}
</div>

<button class="back-top" id="backTop" onclick="scrollTo({top:0,behavior:'smooth'})" title="回到頂端">↑</button>

<script>
const btn = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  btn.classList.toggle('visible', window.scrollY > 400);
});

(function() {
  const headings = document.querySelectorAll('.wrapper h2, .wrapper h3');
  if (headings.length < 3) return;
  const nav = document.createElement('nav');
  nav.className = 'toc-sidebar';
  nav.innerHTML = '<h3>目錄</h3>';
  const ul = document.createElement('ul');
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'heading-' + i;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.substring(0, 40);
    if (h.tagName === 'H3') a.className = 'toc-h3';
    li.appendChild(a);
    ul.appendChild(li);
  });
  nav.appendChild(ul);
  document.body.insertBefore(nav, document.body.firstChild);
})();

(function() {
  const pres = document.querySelectorAll('pre code');
  let hasMermaid = false;
  pres.forEach(code => {
    const text = code.textContent.trim();
    if (code.className.includes('mermaid') || text.startsWith('gantt') || text.startsWith('erDiagram') || text.startsWith('graph') || text.startsWith('flowchart')) {
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = text;
      code.parentElement.replaceWith(div);
      hasMermaid = true;
    }
  });
  if (hasMermaid) {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
    s.onload = () => mermaid.initialize({ startOnLoad: true, theme: 'dark',
      themeVariables: { primaryColor: '#1c2333', primaryTextColor: '#e6edf3',
        primaryBorderColor: '#30363d', lineColor: '#58a6ff',
        secondaryColor: '#161b22', tertiaryColor: '#0d1117' }});
    document.body.appendChild(s);
  }
})();
</script>
</body>
</html>`;

// ── Convert ──
const files = [
  { input: 'mdo/migration-plan.md', output: 'mdo/migration-plan.html', title: '巨大機械 Middle Platform — 資料底層架構遷移計畫' },
  { input: 'mdo/data-object-design.md', output: 'mdo/data-object-design.html', title: '巨大機械 Middle Platform — 資料物件設計文件' },
];

for (const f of files) {
  console.log('Converting ' + f.input + ' → ' + f.output);
  const md = readFileSync(f.input, 'utf-8');
  const html = marked(md);
  const full = HTML_TEMPLATE(f.title, html);
  writeFileSync(f.output, full, 'utf-8');
  console.log('  ✅ Done (' + (Buffer.byteLength(full) / 1024).toFixed(1) + ' KB)');
}

console.log('\\nAll conversions complete!');
