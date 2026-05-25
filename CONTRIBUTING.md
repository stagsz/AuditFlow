# Contributing to AuditFlow

Thank you for your interest in contributing to AuditFlow! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all. Please treat everyone with respect.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing opinions and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Harassment or discrimination
- Offensive language or personal attacks
- Publishing others' private information without consent
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites
- Node.js v22 or higher
- npm or yarn
- Git
- GitHub account
- Supabase account (for database testing)
- Basic knowledge of TypeScript and React

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/auditflow.git
   cd auditflow
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/staffangreisz/auditflow.git
   ```

## Development Setup

### 1. Install Dependencies

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Frontend (.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://fqnorsqggyshqfmihivw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_4hBVz1TFzEwD5cMH0G1cbQ_8uX8KGpR
```

Backend (.env.local):
```bash
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-development-secret
NODE_ENV=development
PORT=3001
```

### 3. Start Development Servers

Terminal 1 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

## Making Changes

### Branch Naming Convention

Use descriptive branch names:
- Feature: `feature/short-description`
- Bug fix: `fix/short-description`
- Documentation: `docs/short-description`
- Refactor: `refactor/short-description`

Example:
```bash
git checkout -b feature/add-audit-export
```

### Commit Messages

Write clear, descriptive commit messages:

```
feat: add audit export to CSV functionality

- Implement CSV export controller
- Add export button to audit details page
- Add tests for export functionality
```

**Format**: `<type>: <subject>`

**Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Other changes that don't modify code

## Code Standards

### TypeScript

- Use strict mode (`"strict": true` in tsconfig.json)
- Define explicit types for all functions and variables
- Avoid `any` type usage
- Use interfaces for object shapes
- Use enums for fixed sets of values

Example:
```typescript
interface Assessment {
  id: string;
  title: string;
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: Date;
}

async function getAssessment(id: string): Promise<Assessment> {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components focused and single-responsibility
- Use TypeScript for prop typing
- Memoize expensive computations with `useMemo`
- Extract custom hooks for reusable logic

Example:
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, children, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

### Express Routes

- Organize routes by feature
- Use middleware for cross-cutting concerns
- Validate inputs with Zod
- Return consistent response formats
- Handle errors consistently

Example:
```typescript
import { Router } from 'express';
import { createAssessment, getAssessments } from '../controllers/assessmentController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

router.get('/', authenticate, getAssessments);
router.post('/', authenticate, validateRequest, createAssessment);

export default router;
```

### Styling

- Use TailwindCSS utility classes
- Avoid inline styles
- Create reusable component classes for complex styles
- Follow the established color scheme

### Error Handling

- Create specific error types
- Include helpful error messages
- Log errors appropriately
- Don't expose sensitive information in error messages

## Testing

### Frontend Testing

Test React components with Jest and React Testing Library:

```bash
cd frontend
npm test
```

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Backend Testing

Test API endpoints and business logic:

```bash
cd backend
npm test
```

Example test:
```typescript
describe('Assessment Controller', () => {
  it('should create a new assessment', async () => {
    const result = await createAssessment({
      title: 'Q1 2026 Assessment',
      description: 'Initial self-assessment',
    });
    expect(result).toHaveProperty('id');
  });
});
```

### Test Requirements

- Write tests for all new features
- Update tests when changing existing functionality
- Aim for >80% code coverage on critical paths
- Run tests before committing: `npm test`

## Submitting Changes

### Before You Submit

1. **Ensure your code follows standards**:
   ```bash
   npm run lint
   ```

2. **Format your code**:
   ```bash
   npm run format
   ```

3. **Run tests locally**:
   ```bash
   npm test
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

5. **Update documentation** if needed

6. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Pull Request Process

### Creating a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature
   ```

2. Go to GitHub and create a Pull Request

3. Fill out the PR template completely:
   - Clear description of changes
   - Link to related issues
   - Screenshots (for UI changes)
   - Testing instructions
   - Checklist completion

### PR Title Format

Use the same format as commit messages:
```
feat: add assessment status filter to dashboard
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Related Issues
Fixes #123
Related to #456

## Changes
- Change 1
- Change 2
- Change 3

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console errors/warnings
- [ ] Performance impact considered
```

### Review Process

1. At least one maintainer review required
2. Address review comments
3. Request re-review after changes
4. Maintainer merges when approved

## Reporting Bugs

### Before Reporting

- Check existing issues
- Ensure it's reproducible
- Test on latest version

### Bug Report Template

```markdown
## Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox/Safari
- Version: 1.0.0

## Screenshots
Add screenshots if applicable.

## Additional Context
Any other relevant information.
```

## Suggesting Enhancements

### Enhancement Request Template

```markdown
## Is your feature request related to a problem?
Description of the problem.

## Describe the solution you'd like
Clear description of the desired feature.

## Describe alternatives you've considered
Other solutions or features considered.

## Additional context
Any other context or screenshots.

## Benefit
How this benefits users or the project.
```

## Development Tips

### Debugging Frontend
```bash
# Use Next.js debugging
NODE_OPTIONS="--inspect-brk" npm run dev
```

### Debugging Backend
```bash
# Use Node debugging
node --inspect-brk -r ts-node/register src/index.ts
```

### Database Debugging
```bash
# Use Prisma Studio
npx prisma studio
```

### Git Tips
```bash
# Amend last commit
git commit --amend

# Interactive rebase
git rebase -i HEAD~n

# Stash changes
git stash
git stash pop

# View branch history
git log --graph --oneline --all
```

## Useful Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Jest Testing Library](https://testing-library.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)

## Questions?

- Create a discussion on GitHub
- Open an issue with the question tag
- Check existing documentation

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- GitHub contributors page
- Release notes

Thank you for contributing to AuditFlow! 🎉
