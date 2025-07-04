import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateElevation, calculateRiseFall } from '../src/utils/calculations.js';

test('calculateElevation adds backsight', () => {
  assert.strictEqual(calculateElevation(1.5, 0.5, null), 2);
});

test('calculateElevation subtracts foresight', () => {
  assert.strictEqual(calculateElevation(1.5, null, 0.5), 1);
});

test('calculateRiseFall positive difference', () => {
  const { rise, fall } = calculateRiseFall(2, 1);
  assert.strictEqual(rise, 1);
  assert.strictEqual(fall, null);
});

test('calculateRiseFall negative difference', () => {
  const { rise, fall } = calculateRiseFall(1, 2);
  assert.strictEqual(rise, null);
  assert.strictEqual(fall, 1);
});
