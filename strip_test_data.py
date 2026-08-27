import re

with open('src/server/db.ts', 'r') as f:
    content = f.read()

# Remove seedKMarTestScenarios entirely
pattern = re.compile(r'  // -+\n  // KMAR OPERATIONELE TESTSCENARIO\'S GENERATOR\n  // -+\n  public seedKMarTestScenarios.*', re.DOTALL)
content = pattern.sub('', content)

# But ensure clearAllData is still there, wait! I matched to the end of file!
