const fs = require('fs');
const path = require('path');

const filesToProcess = [
    "src/Components/Dashboards/AdminDashboard.jsx",
    "src/Components/Dashboards/PoliceDashboard.jsx",
    "src/Components/Dashboards/UserDashboard.jsx",
    "src/Components/Dashboards/CaseDetailsModal.jsx",
    "src/Components/Pages/HomePage.jsx"
];

const replacements = [
    { old: /bg-white\/40(?! dark:)/g, new: "bg-white/40 dark:bg-white/5" },
    { old: /border-white\/60(?! dark:)/g, new: "border-white/60 dark:border-white/10" },
    { old: /border-gray-100\/50(?! dark:)/g, new: "border-gray-100/50 dark:border-white/10" },
    { old: /text-\[\#1d1d1f\](?! dark:)/g, new: "text-[#1d1d1f] dark:text-white" },
    { old: /text-\[\#86868b\](?! dark:)/g, new: "text-[#86868b] dark:text-[#a1a1a6]" },
    { old: /border-gray-200(?! dark:)/g, new: "border-gray-200 dark:border-white/10" },
    { old: /border-gray-100(?! dark:)/g, new: "border-gray-100 dark:border-white/10" },
    { old: /hover:bg-gray-100(?! dark:)/g, new: "hover:bg-gray-100 dark:hover:bg-white/10" },
    { old: /bg-gray-50(?! dark:)/g, new: "bg-gray-50 dark:bg-white/5" },
    { old: /bg-\[\#f5f5f7\](?! dark:)/g, new: "bg-[#f5f5f7] dark:bg-[#1c1c1e]" },
    { old: /(?<!-)bg-white(?!\/)(?! dark:)/g, new: "bg-white dark:bg-[#1c1c1e]" }
];

filesToProcess.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
        console.log("File not found:", filePath);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    replacements.forEach(r => {
        content = content.replace(r.old, r.new);
    });
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Processed:", filePath);
});
