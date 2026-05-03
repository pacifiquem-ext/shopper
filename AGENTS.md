# AI Agent Guidelines for OnlineShop.rw

Welcome to the OnlineShop.rw project! As an AI agent working in this codebase, you must adhere strictly to the rules and standards defined for this project to ensure code quality, consistency, and compatibility.

## 1. Coding Standards

Before you begin writing or modifying any code, you must consult the appropriate coding standards based on the section of the stack you are working on:

### Frontend (Client) Work

- **Required Reading:** When working on any frontend code (Next.js, React components, styling, UI/UX), you **MUST ALWAYS** check and follow the rules defined in [client-coding-standards.md](./.agents/rules/client-coding-standards.md).
- Do not make assumptions about frontend architecture or styling without reference to this document.

### Backend (Server) Work

- **Required Reading:** When working on any backend code (NestJS, APIs, database schema, services), you **MUST ALWAYS** check and follow the rules defined in [server-coding-standards.md](./.agents/rules/server-coding-standards.md).
- Ensure all data contracts, middleware logic, and service implementations align with these guidelines.

## 2. Agent Skills

This project leverages specialized AI skills to enhance output quality. Depending on the task you are assigned, you _might_ need to check and utilize the dedicated skills located in the `.agents/skills` directory:

- **Frontend & UI/UX:** For highly polished, production-grade interfaces, refer to the skills `frontend-design` and `ui-ux-pro-max`.
- **Framework Best Practices:** For architectural integrity, refer to the specific best practices skills like `nestjs-best-practices` (for backend) or `next-best-practices` (for frontend).

## 3. General Rules

- Always verify cross-compatibility between the frontend and backend when modifying contracts or API data.
- If you are unsure about an implementation detail or if a standard is unclear, stop and ask the user for clarification before proceeding.
- Ensure that all user-visible text is done via i18n translation. Making it easy to support multiple language later afterwards for both frontend and backend.

## 4. i18n Translation Rules

- **Required Reading:** When working on any i18n translation, you **MUST ALWAYS** check and follow the rules defined in [i18n-rules.md](./.agents/rules/i18n-rules.md).
- Do not make assumptions about i18n translation without reference to this document.

---

_By following these guidelines, you ensure that the OnlineShop.rw platform remains robust, scalable, and true to its architectural vision._
