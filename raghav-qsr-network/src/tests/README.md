# Tests Directory

Test scripts for the eval system.

## Test Files

### Testing Progression

```
1. test-eval          (30 sec)   → Smoke test
2. test-adversarial   (3-5 min)  → Stress test (BREAK IT)
3. test-sample        (3-5 min)  → Balanced test
4. validate-evals     (10-15 min)→ Full validation
```

---

### `test-eval.ts`
Quick smoke test (4 tests, ~30 seconds):
- Tests individual shocking-number-contrast eval
- Tests master viral-quality eval
- Validates on known quality/flop posts + sample
- **Run:** `npm run test-eval`
- **Output:** `results/test-eval-results.json`

### `adversarial-eval-test.ts` 🔥 **RECOMMENDED FIRST**
Adversarial stress test (20 posts, ~3-5 minutes):
- **DESIGNED TO BREAK THE SYSTEM**
- Tests hardest edge cases (single-signal posts, borderline flops)
- Compares detected signals vs annotated signals
- Measures precision/recall/F1 for signal detection
- Forces 2-3 iterations before production readiness
- **Expected to FAIL on first run** (by design)
- **Run:** `npm run test-adversarial`
- **Output:** `results/adversarial-test-results.json`

### `strategic-sample-test.ts`
Strategic sample (20 posts, ~3-5 minutes):
- 12 quality posts covering all signal types
- 8 flop posts covering all anti-patterns
- Balanced mix of difficulty levels
- Goal: 95%+ accuracy before full validation
- **Run AFTER adversarial test passes**
- **Run:** `npm run test-sample`
- **Output:** `results/strategic-sample-results.json`

### `validate-evals.ts`
Full validation (56 posts, ~10-15 minutes):
- Tests master eval on ALL posts
- Measures accuracy against ground truth
- Identifies misclassified posts
- **Run ONLY AFTER adversarial + strategic tests pass**
- **Run:** `npm run validate-evals`
- **Output:** `results/validation-results.json`

---

## Recommended Workflow

```bash
# Step 1: Smoke test (make sure nothing crashes)
npm run test-eval

# Step 2: Adversarial test (EXPECT TO FAIL - designed to break system)
npm run test-adversarial
# → Review failures, fix issues, re-run until 80%+ accuracy

# Step 3: Strategic sample (balanced test)
npm run test-sample
# → Should pass if adversarial test passed

# Step 4: Full validation (final check)
npm run validate-evals
# → Confirms 90%+ accuracy on entire dataset
```

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

