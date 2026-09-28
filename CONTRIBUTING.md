# Contributing

## Requirements before opening a PR

```bash
npm run lint
npm run typecheck
npm test
```

## Commits

Conventional Commits (`type(scope): subject`). Scope is one of: `contract`, `db`, `widget`, `notice`,
`ci`, `docs`.

## Pull requests

One PR per concern. Features ship with their tests in the same PR. Every PR must check exactly one
box:

```markdown
## Contract impact
- [ ] This PR does not change `/api` or `/widget`
- [ ] This PR extends the contract in a backward-compatible way (MINOR, docs updated)
- [ ] This PR is a breaking contract change (MAJOR, requires a new version path, the old path kept
      for at least 90 days, and two reviewer approvals)
```

## Code style

TypeScript strict mode, no `any`. Comments only where the reason for something is not obvious from
the code itself.
