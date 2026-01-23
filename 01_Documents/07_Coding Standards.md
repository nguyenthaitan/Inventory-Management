## Coding Standards Draft

### 1. General Principles
- Code must be clear, readable, and maintainable.
- Use English for code, comments, and documentation (except UI/UX text for end-users).
- Follow DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid) principles.
- Use version control (Git) for all source code.

### 2. Frontend (React, JavaScript, CSS)
- Use functional components and React Hooks.
- Use TypeScript for type safety.
- Follow Airbnb JavaScript/React style guide.
- Use SCSS or CSS Modules for styling; avoid inline styles.
- Name components and files in PascalCase.
- Use ESLint and Prettier for code formatting and linting.
- Write meaningful commit messages.

### 3. Backend (Node.js, NestJS, TypeScript)
- Use TypeScript for all backend code.
- Follow NestJS best practices for module, controller, and service structure.
- Use dependency injection provided by NestJS.
- Name files in kebab-case, classes in PascalCase, variables/functions in camelCase.
- Validate all API inputs (DTOs, validation pipes).
- Use async/await for asynchronous code.
- Handle errors with try/catch and proper logging.
- Use ESLint and Prettier for code formatting and linting.

### 4. Database (MongoDB, MySQL)
- Use clear, consistent naming for collections/tables and fields (snake_case or camelCase, be consistent).
- Define indexes for frequently queried fields.
- Use migrations for schema changes (where applicable).
- Avoid storing sensitive data in plain text.

### 5. Documentation & Comments
- Write JSDoc/TSDoc comments for all public functions, classes, and modules.
- Document API endpoints (e.g., with Swagger/OpenAPI for backend).
- Use README files for module-level documentation.
- Keep documentation up to date with code changes.

### 6. Testing
- Write unit tests for core logic (Jest for backend, React Testing Library for frontend).
- Use descriptive test names and group related tests.
- Ensure tests are repeatable and independent.

---
*This draft should be reviewed and updated by the team to fit project-specific needs.*
