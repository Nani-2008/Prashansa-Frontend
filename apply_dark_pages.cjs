const fs = require('fs');
const path = require('path');

const files = [
    'src/Components/Pages/TrackPage.jsx',
    'src/Components/Pages/ComplaintPage.jsx',
    'src/Components/Pages/ChatPage.jsx',
    'src/Components/Pages/LoginPage.jsx'
];

const replacements = [
    { old: /bg-\[\#fbfbfd\](?! dark:)/g, new: "bg-[#fbfbfd] dark:bg-transparent" },
    { old: /bg-white\/70(?! dark:)/g, new: "bg-white/70 dark:bg-[#1e2333]/70" },
    { old: /border-white\/60(?! dark:)/g, new: "border-white/60 dark:border-white/10" },
    { old: /text-\[\#1d1d1f\](?! dark:)/g, new: "text-[#1d1d1f] dark:text-white" },
    { old: /text-\[\#86868b\](?! dark:)/g, new: "text-[#86868b] dark:text-[#a1a1a6]" },
    { old: /bg-\[\#f5f5f7\]\/80(?! dark:)/g, new: "bg-[#f5f5f7]/80 dark:bg-[#121212]/80" },
    { old: /bg-\[\#f5f5f7\](?![\/\w])(?! dark:)/g, new: "bg-[#f5f5f7] dark:bg-[#1c1c1e]" },
    { old: /focus:bg-white\/90(?! dark:)/g, new: "focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90" },
    { old: /border-gray-100\/50(?! dark:)/g, new: "border-gray-100/50 dark:border-white/5" },
    { old: /border-gray-200(?![\/\w])(?! dark:)/g, new: "border-gray-200 dark:border-white/10" },
    { old: /border-gray-100(?![\/\w])(?! dark:)/g, new: "border-gray-100 dark:border-white/10" },
    { old: /hover:bg-\[\#0066cc\]\/\[0\.02\](?! dark:)/g, new: "hover:bg-[#0066cc]/[0.02] dark:hover:bg-[#0066cc]/10" },
    { old: /(?<!-)bg-white(?![\/\w])(?! dark:)/g, new: "bg-white dark:bg-[#1e2333]/70" },
    { old: /bg-\[\#1d1d1f\]\/90(?! dark:)/g, new: "bg-[#1d1d1f]/90 dark:bg-[#0066cc]/90" },
    { old: /text-\[\#1d1d1f\]\/80(?! dark:)/g, new: "text-[#1d1d1f]/80 dark:text-white/80" },
    { old: /placeholder:text-\[\#86868b\]\/70(?! dark:)/g, new: "placeholder:text-[#86868b]/70 dark:placeholder:text-[#a1a1a6]/70" }
];

files.forEach(f => {
    const filePath = path.join(__dirname, f);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        replacements.forEach(r => {
            content = content.replace(r.old, r.new);
        });
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', f);
    } else {
        console.log('Not found', f);
    }
});
