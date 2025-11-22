# Tests Directory

Test scripts for the eval system.

## Test Files

### `test-eval.ts`
Quick smoke test (4 tests, ~30 seconds):
- Tests individual shocking-number-contrast eval
- Tests master viral-quality eval
- Validates on known quality/flop posts + sample
- **Run:** `npm run test-eval`
- **Output:** `results/test-eval-results.json`

### `validate-evals.ts` (in scripts/)
Full validation (56 posts, ~1 hour):
- Tests master eval on ALL posts
- Measures accuracy against ground truth
- Identifies misclassified posts
- **Run:** `npm run validate-evals`
- **Output:** `results/validation-results.json`

## Results Directory

All test outputs saved to `tests/results/`:
- `test-eval-results.json` - Quick test results
- `validation-results.json` - Full validation results

## Usage

**Quick check (run first):**
```bash
npm run test-eval
```

**Full validation (run after quick check passes):**
```bash
npm run validate-evals
```

## Pass Criteria

### test-eval.ts
- Test 1: Quality post scores >= 0.85 ✅
- Test 2: Flop post scores < 0.5 ✅
- Test 3: Sample post scores >= 0.8 ✅
- Test 4: Master eval scores >= 0.85 ✅

### validate-evals.ts
- Quality posts: >= 90% score 0.85+ (28/31 posts)
- Flop posts: >= 90% score < 0.85 (23/25 posts)
- Overall accuracy: >= 90% (51/56 posts)

