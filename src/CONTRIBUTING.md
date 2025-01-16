# Contributing to Tasty Tales

We welcome contributions from everyone. To make sure that we can collaborate effectively, please follow these guidelines.

## Branching Strategy

We use the **Git Flow** model for managing branches. Here's how it works:

- **`main`**: Contains stable, production-ready code.
- **`develop`**: Used for integrating features before a release.
- **Feature Branches**: When adding a new feature, create a feature branch off of `develop`. Name it `feature/your-feature-name`.

## How to Contribute

1. Fork the repository.
2. Create a feature or bug-fix branch from `dev` (e.g., `feature/my-feature` or `bugfix/fix-bug`).
3. Write tests for your changes and ensure they pass.
4. Commit your changes with clear and descriptive commit messages.
5. Push your changes to your forked repository.
6. Open a Pull Request (PR) against the `develop` branch of the main repository.

## Pull Request Process

1. Ensure your branch is up-to-date with the latest `dev` branch.
2. Provide a descriptive title and summary for your PR.
3. Include any necessary tests or documentation updates in the PR.
4. Request at least one reviewer for your PR.
5. After approval, merge your PR and delete the feature branch.

## Code Style

- Use **Prettier** for formatting.
- Ensure all code is properly documented.

## Testing

- Write unit tests for new features or bug fixes.
- Run `npm test` to ensure all tests pass before submitting your PR.
