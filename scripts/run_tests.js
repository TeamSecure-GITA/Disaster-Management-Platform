#!/usr/bin/env node

/**
 * Universal Disaster Management Platform Test Suite Runner
 * Runs all unit, integration, ML and build tests with a consolidated report.
 */

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT_DIR = path.resolve(__dirname, "..");
const results = [];

function runTestStep(name, command, args, cwd) {
  console.log(`\n==================================================`);
  console.log(`▶ Running Test: ${name}`);
  console.log(`Directory: ${cwd}`);
  console.log(`Command: ${command} ${args.join(" ")}`);
  console.log(`==================================================`);

  const startTime = Date.now();
  const res = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  const passed = res.status === 0;
  results.push({ name, passed, duration, code: res.status });
  if (!passed) {
    console.error(`❌ Test failed: ${name} (exit code ${res.status})`);
  } else {
    console.log(`✅ Test passed: ${name} in ${duration}s`);
  }
  return passed;
}

console.log("Starting Full Platform Test Execution...\n");

// 1. ML Backend Pytest
const mlVenvPytest = path.join(ROOT_DIR, "ml_backend/.venv/bin/pytest");
const pytestCmd = fs.existsSync(mlVenvPytest) ? mlVenvPytest : "pytest";
runTestStep("ML & AI Subsystem Tests (69 Model & Workflow Tests)", pytestCmd, ["tests/"], path.join(ROOT_DIR, "ml_backend"));

// 2. Express Backend Jest Tests
runTestStep("Backend Core Services (30 Auth, Risk, SOS & Shelter Tests)", "npm", ["test"], path.join(ROOT_DIR, "Backend"));

// 3. Frontend Bundle & Lint Validation
runTestStep("Frontend Production Bundle & PWA Validation", "npm", ["run", "build"], path.join(ROOT_DIR, "frontend"));

// 4. Mobile Architecture Integrity Validation
runTestStep("Mobile Architecture & Directory Tree Integrity", "python3", [path.join(ROOT_DIR, "scripts/verify_mobile.py")], ROOT_DIR);

// Summary Report
console.log(`\n==================================================`);
console.log(`              FINAL TEST SUMMARY REPORT           `);
console.log(`==================================================`);
let allPassed = true;
for (const r of results) {
  const icon = r.passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${icon} | ${r.name.padEnd(45)} | ${r.duration}s`);
  if (!r.passed) allPassed = false;
}
console.log(`==================================================`);

if (allPassed) {
  console.log("🎉 ALL TESTS PASSED! PLATFORM IS FULLY OPERATIONAL AND READY.");
  process.exit(0);
} else {
  console.error("⚠️ Some tests failed. Please review the output above.");
  process.exit(1);
}
