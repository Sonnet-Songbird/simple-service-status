import { execFileSync } from 'node:child_process'

execFileSync('npx', ['tsx', 'scripts/gen-contract.ts'], { stdio: 'inherit' })

try {
  execFileSync('git', ['diff', '--exit-code', 'docs/contract/openapi.yaml'], { stdio: 'inherit' })
  console.log('docs/contract/openapi.yaml is in sync with src/contract/v1/schemas.ts')
} catch {
  console.error('docs/contract/openapi.yaml is out of date — run "npm run gen:contract" and commit the result')
  process.exit(1)
}
