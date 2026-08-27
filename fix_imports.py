with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("import expressimport nodemailer from 'nodemailer';, { Request, Response } from 'express';", "import express, { Request, Response } from 'express';\\nimport nodemailer from 'nodemailer';")

with open('server.ts', 'w') as f:
    f.write(content.replace("import expressimport nodemailer from 'nodemailer';, { Request, Response } from 'express';", "import express, { Request, Response } from 'express';\nimport nodemailer from 'nodemailer';"))
