import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

pattern = re.compile(r'\s*public static async seedKMarTestScenarios\(\): Promise<string> \{.*?\n  \}\n', re.DOTALL)
content = pattern.sub('', content)

with open('src/services/api.ts', 'w') as f:
    f.write(content)
