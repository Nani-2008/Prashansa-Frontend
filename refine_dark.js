import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToProcess = [
    "src/Components/Dashboards/AdminDashboard.jsx",
    "src/Components/Dashboards/PoliceDashboard.jsx",
    "src/Components/Dashboards/UserDashboard.jsx",
    "src/Components/Dashboards/CaseDetailsModal.jsx",
    "src/Components/Pages/HomePage.jsx",
    "src/Components/Pages/DashboardPage.jsx"
];

const replacements = [
    { old: /bg-\[\#f5f5f7\] dark:bg-\[\#1c1c1e\]\/50/g, new: "bg-[#f5f5f7]/50 dark:bg-[#1c1c1e]/50" },
    { old: /dark:bg-white\/5/g, new: "dark:bg-white/5" }, // we can keep white/5, it's nice for glass
    { old: /bg-white\/40 dark:bg-white\/5/g, new: "bg-white/40 dark:bg-[#1e2333]/70" }, // change card bg to match sidebar hue
    { old: /dark:border-white\/10/g, new: "dark:border-white/10" }
];

filesToProcess.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    replacements.forEach(r => {
        content = content.replace(r.old, r.new);
    });
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Processed:", filePath);
});
