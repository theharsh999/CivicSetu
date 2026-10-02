/**
 * CivicSetu AI Engine Verification Script
 * Validates classification, confidence calibration, and urgency detection
 * across diverse benchmark complaints.
 */

import { analyzeGrievance } from '../services/ai/aiService.js';

const SAMPLE_COMPLAINTS = [
  {
    name: 'Required Benchmark 1: Water Disruption',
    text: 'There has been no water supply in our area for three days.',
  },
  {
    name: 'Required Benchmark 2: Garbage Collection',
    text: 'Garbage has not been collected near our society for a week.',
  },
  {
    name: 'High Severity: Hazardous Pothole',
    text: 'A dangerous deep pothole outside City Center school is causing road accidents and vehicle damage.',
  },
  {
    name: 'Critical Hazard: Exposed Live Wire',
    text: 'Dangling live electrical wire sparking against street pole near hospital entrance.',
  },
  {
    name: 'Severe Hazard: Open Manhole',
    text: 'Uncovered open sewer manhole on main walking street, child almost fell in last evening.',
  },
  {
    name: 'Vector Health: Mosquito Breeding',
    text: 'Stagnant rainwater pool in vacant plot breeding mosquitoes, multiple dengue cases reported.',
  },
  {
    name: 'Traffic: Signal Failure',
    text: 'Traffic signal not working at major four-way crossroad causing massive bottleneck and traffic jam.',
  },
  {
    name: 'Parks: Broken Playground Swing',
    text: 'Playground equipment broken in community park, metal swing chain snapped with sharp edges.',
  },
  {
    name: 'Water: Pipe Leakage',
    text: 'Underground drinking water pipe burst, huge clean water pipeline leakage spraying on road.',
  },
  {
    name: 'Drainage: Sewage Overflow',
    text: 'Choked drain causing black sewage overflow and foul smell across entire society gate.',
  },
  {
    name: 'Hinglish: Road Potholes',
    text: 'Hamare area ki sadak par bahut bade gaddhe ho gaye hain, paani bhar gaya hai.',
  },
  {
    name: 'Vague / Low Confidence Sample',
    text: 'Please check this problem near the corner building as soon as possible.',
  },
];

const runTests = async () => {
  console.log(`\n======================================================`);
  console.log(`🤖 CivicSetu Prototype AI Analysis Engine Verification`);
  console.log(`Engine: Rule-Based Deterministic NLP (rule-based-nlp-v1)`);
  console.log(`======================================================\n`);

  const results = [];

  for (const sample of SAMPLE_COMPLAINTS) {
    const output = await analyzeGrievance({
      title: sample.text.slice(0, 50),
      description: sample.text,
      location: { ward: 'Ward 1 - Central' },
    });

    results.push({
      Benchmark: sample.name,
      Input: sample.text.length > 55 ? sample.text.slice(0, 52) + '...' : sample.text,
      Department: output.department,
      Category: output.category,
      Priority: output.priority,
      Confidence: `${Math.round(output.confidence * 100)}%`,
      ManualReview: output.needsManualReview ? '⚠️ Flagged' : '✅ Clear',
      UrgencySignals: output.urgencySignals.slice(0, 2).join('; ') || 'None',
    });
  }

  console.table(results);

  // Assert exact benchmarks
  const b1 = await analyzeGrievance({
    title: 'Water problem',
    description: 'There has been no water supply in our area for three days.',
  });

  const b2 = await analyzeGrievance({
    title: 'Garbage problem',
    description: 'Garbage has not been collected near our society for a week.',
  });

  console.log(`\n======================================================`);
  console.log(`🎯 SPECIFICATION VERIFICATION`);
  console.log(`======================================================`);
  console.log(`1. 'There has been no water supply in our area for three days.'`);
  console.log(`   Expected: Water Supply -> Water Supply Disruption, High, ~90%+`);
  console.log(`   Result:   ${b1.department} -> ${b1.category}, Priority: ${b1.priority}, Confidence: ${Math.round(b1.confidence * 100)}%`);
  console.log(`   Signals:  ${b1.urgencySignals.join(', ')}`);

  console.log(`\n2. 'Garbage has not been collected near our society for a week.'`);
  console.log(`   Expected: Garbage & Waste -> Garbage Collection, Medium, ~90%`);
  console.log(`   Result:   ${b2.department} -> ${b2.category}, Priority: ${b2.priority}, Confidence: ${Math.round(b2.confidence * 100)}%`);
  console.log(`   Signals:  ${b2.urgencySignals.join(', ')}`);

  const b1Pass =
    b1.department === 'WATER' &&
    b1.category === 'Water Supply Disruption' &&
    b1.priority === 'High' &&
    b1.confidence >= 0.88;

  const b2Pass =
    b2.department === 'WASTE' &&
    b2.category === 'Garbage Collection' &&
    b2.priority === 'Medium' &&
    b2.confidence >= 0.88;

  if (b1Pass && b2Pass) {
    console.log(`\n✅ ALL BENCHMARK SPECIFICATIONS PASSED!`);
  } else {
    console.warn(`\n⚠️ Benchmark calibration check did not meet all exact targets.`);
  }

  console.log(`======================================================\n`);
};

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
