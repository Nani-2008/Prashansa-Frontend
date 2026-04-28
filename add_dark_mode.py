import re
import os

files_to_process = [
    r"c:\Users\nanid\OneDrive\Documents\Full-Stack\Frontend\Frontend\src\Components\Dashboards\AdminDashboard.jsx",
    r"c:\Users\nanid\OneDrive\Documents\Full-Stack\Frontend\Frontend\src\Components\Dashboards\PoliceDashboard.jsx",
    r"c:\Users\nanid\OneDrive\Documents\Full-Stack\Frontend\Frontend\src\Components\Dashboards\UserDashboard.jsx",
    r"c:\Users\nanid\OneDrive\Documents\Full-Stack\Frontend\Frontend\src\Components\Dashboards\CaseDetailsModal.jsx",
    r"c:\Users\nanid\OneDrive\Documents\Full-Stack\Frontend\Frontend\src\Components\Pages\HomePage.jsx"
]

replacements = {
    r"bg-white/40": "bg-white/40 dark:bg-white/5",
    r"border-white/60": "border-white/60 dark:border-white/10",
    r"border-gray-100/50": "border-gray-100/50 dark:border-white/10",
    r"text-\[\#1d1d1f\]": "text-[#1d1d1f] dark:text-white",
    r"text-\[\#86868b\]": "text-[#86868b] dark:text-[#a1a1a6]",
    r"border-gray-200": "border-gray-200 dark:border-white/10",
    r"border-gray-100": "border-gray-100 dark:border-white/10",
    r"hover:bg-gray-100": "hover:bg-gray-100 dark:hover:bg-white/10",
    r"bg-gray-50": "bg-gray-50 dark:bg-white/5",
    r"bg-\[\#f5f5f7\]": "bg-[#f5f5f7] dark:bg-[#1c1c1e]",
    r"(?<!-)bg-white(?!\/)": "bg-white dark:bg-[#1c1c1e]", # bg-white but not -bg-white or bg-white/40
}

for file_path in files_to_process:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Prevent double replacement if script is run twice
    for old, new in replacements.items():
        # Using a simplistic approach: if the new string already exists, we might still replace the old one if there's a mix.
        # It's better to just regex replace specifically.
        # A simple check: if 'dark:bg-white/5' is in content, maybe we already ran it?
        # Let's just do standard regex sub.
        # Actually to be safe, only replace if not followed by dark: variant
        pass
        
    for old, new in replacements.items():
        # If the file already has the new string, we skip replacing to prevent doubling
        # E.g. bg-white/40 dark:bg-white/5 dark:bg-white/5
        content = re.sub(old + r"(?! dark:)", new, content)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done replacing.")
