import re

with open('src/components/admin/UserManager.tsx', 'r') as f:
    content = f.read()

# Add email to state
content = content.replace("password?: string;", "password?: string;\n    email?: string;")
content = content.replace("password: '',", "password: '',\n    email: '',")
content = content.replace("password: formData.password || 'kmar2026',", "password: formData.password || 'kmar2026',\n          email: formData.email,")
content = content.replace("...(formData.password ? { password: formData.password } : {}),", "...(formData.password ? { password: formData.password } : {}),\n          email: formData.email,")
content = content.replace("name: user.name,", "name: user.name,\n      email: user.email || '',")

# Add Email field in form
email_field = """
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101d] border-[#1e334d]'
                    }`}
                    placeholder="naam@marechaussee.nl"
                  />
                </div>
"""

password_field = """                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    {editingUser ? 'Wachtwoord (Laat leeg om niet te wijzigen)' : 'Wachtwoord *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}"""

# Find the password field and insert email field before it
if "type=\"password\"" in content:
    content = re.sub(r'<\s*div[^>]*>[\s\n]*<\s*label[^>]*>[\s\n]*(Nieuw )?Wachtwoord[\s\S]*?<\s*input[\s\S]*?type="password"[\s\S]*?/\s*>\s*<\s*/div\s*>', email_field + password_field + r'\n                    className={`w-full border rounded-xl px-3 py-2 text-xs outline-none ${isLight ? \'bg-slate-50 border-slate-200\' : \'bg-[#08101d] border-[#1e334d]\'}`}\n                    placeholder={editingUser ? "Laat leeg voor geen wijziging" : "Typ een veilig wachtwoord"}\n                  />\n                </div>', content)

with open('src/components/admin/UserManager.tsx', 'w') as f:
    f.write(content)
