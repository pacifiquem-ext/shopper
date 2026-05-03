---
trigger: always_on
---

# i18n Translation Rules

The OnlineShop.rw platform STRICTLY enforces internationalization (i18n) across both the frontend (`client`) and backend (`server`) applications. It is **MANDATORY** that every user-facing text, error message, and validation message be translated into both English (`en`) and Kinyarwanda (`rw`).

## 1. Client (Frontend) Translation Rules

The frontend uses `next-intl` for internationalization.

- **File Locations**:
  - English: [client/src/i18n/locales/en.json](<PROJECT_ROOT>/client/src/i18n/locales/en.json:0:0-0:0)
  - Kinyarwanda: [client/src/i18n/locales/rw.json](<PROJECT_ROOT>/client/src/i18n/locales/rw.json:0:0-0:0)
- **Rule**: Whenever you add, modify, or remove a translation key in the client, you **MUST** apply the exact same change to both [en.json](<PROJECT_ROOT>/client/src/i18n/locales/en.json:0:0-0:0) and [rw.json](<PROJECT_ROOT>/client/src/i18n/locales/rw.json:0:0-0:0).
- **Usage**: Always use the `useTranslations` hook or the appropriate server-side translation getter. Never hardcode user-facing strings in the React components.

## 2. Server (Backend) Translation Rules

The backend splits translations into multiple modular JSON files organized by language directory.

- **Directory Locations**:
  - English: `server/src/languages/en/` (e.g., `auth.json`, `common.json`, `validation.json`, etc.)
  - Kinyarwanda: `server/src/languages/rw/`
- **Rule**: Whenever you add or modify a server-side message (e.g., an exception message, validation error, or email template), you **MUST** ensure the translation key is added to the relevant `.json` file in **both** the `en/` and `rw/` directories.
- **Missing Directories**: If the Kinyarwanda (`rw`) directory or file does not exist when you are adding a translation, you **MUST** create it to maintain parity with the English (`en`) directory.
- **Usage**: Use the `I18nService` from `nestjs-i18n` (or the equivalent configured translation module) to resolve messages. Never hardcode error strings or return messages directly in controllers or services.

## 3. General Principles

1. **Absolute Parity**: The `en` and `rw` translation files must have the exact same structure and keys at all times.
2. **No Hardcoding**: Hardcoding English or Kinyarwanda text directly into `.ts` or `.tsx` files is strictly prohibited.
3. **Descriptive Keys**: Use meaningful, domain-specific translation keys (e.g., `auth.errors.invalidPassword` rather than `error1`).

**CRITICAL: Any change involving user-facing text is considered INCOMPLETE until both `en` and `rw` translations are implemented in both the client and the server. No exceptions.**
