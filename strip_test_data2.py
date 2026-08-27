import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Find the start of seedKMarTestScenarios
start_idx = content.find("  // KMAR OPERATIONELE TESTSCENARIO'S GENERATOR")

if start_idx != -1:
    # Find the end by looking for "export const db = new LawEnforcementDatabase();"
    end_idx = content.find("export const db = new LawEnforcementDatabase();")
    
    if end_idx != -1:
        # Keep everything up to start_idx, and then just add the export
        new_content = content[:start_idx] + "}\n\nexport const db = new LawEnforcementDatabase();\n"
        with open('src/server/db.ts', 'w') as f:
            f.write(new_content)
