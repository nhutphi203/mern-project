# Medical Records System - Comprehensive Test Runner (PowerShell)
# ✅ COMPREHENSIVE TEST SUITE according to safety plan

param(
    [switch]$Integration,
    [switch]$Performance,
    [switch]$Security,
    [switch]$Integrity,
    [switch]$Coverage,
    [switch]$Help,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Test configuration
$env:NODE_ENV = "test"
$env:TEST_VERBOSE = "true"
$env:FORCE_COLOR = "1"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Function to run test suite
function Invoke-TestSuite {
    param(
        [string]$TestName,
        [string]$TestPattern,
        [int]$Timeout = 30000
    )
    
    Write-Status "Running $TestName..."
    
    try {
        $result = npm test -- --testTimeout=$Timeout --testPathPattern="$TestPattern" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$TestName completed successfully"
            return $true
        } else {
            Write-Error-Custom "$TestName failed"
            Write-Host $result -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Error-Custom "$TestName failed with exception: $_"
        return $false
    }
}

# Function to setup test environment
function Initialize-TestEnvironment {
    Write-Status "Setting up test environment..."
    
    # Check if node_modules exists
    if (!(Test-Path "node_modules")) {
        Write-Status "Installing dependencies..."
        npm install
    }
    
    # Seed test data
    Write-Status "Seeding test data..."
    try {
        npm run seed:test-data
    } catch {
        Write-Warning-Custom "Test data seeding failed - continuing anyway"
    }
    
    Write-Success "Test environment ready"
}

# Function to cleanup test environment
function Clear-TestEnvironment {
    Write-Status "Cleaning up test environment..."
    try {
        npm run cleanup:test-data
    } catch {
        Write-Warning-Custom "Test data cleanup failed"
    }
    Write-Success "Test environment cleaned"
}

# Function to generate test report
function New-TestReport {
    Write-Status "Generating comprehensive test report..."
    
    # Create test report directory
    if (!(Test-Path "test-reports")) {
        New-Item -ItemType Directory -Path "test-reports" -Force
    }
    
    # Generate coverage report
    try {
        npm run test:coverage -- --coverageDirectory=test-reports/coverage
    } catch {
        Write-Warning-Custom "Coverage report failed"
    }
    
    # Generate detailed test results
    try {
        npm test -- --verbose --outputFile=test-reports/test-results.json --json
    } catch {
        Write-Warning-Custom "JSON report failed"
    }
    
    Write-Success "Test reports generated in test-reports/"
}

# Show help
function Show-Help {
    Write-Host "Medical Records System Test Runner (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\run-tests.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  -Help               Show this help message" -ForegroundColor Gray
    Write-Host "  -Integration        Run only integration tests" -ForegroundColor Gray
    Write-Host "  -Performance        Run only performance tests" -ForegroundColor Gray
    Write-Host "  -Security           Run only security tests" -ForegroundColor Gray
    Write-Host "  -Integrity          Run only data integrity tests" -ForegroundColor Gray
    Write-Host "  -Coverage           Run with coverage report" -ForegroundColor Gray
    Write-Host "  -Verbose            Run with verbose output" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\run-tests.ps1                Run all test suites" -ForegroundColor Gray
    Write-Host "  .\run-tests.ps1 -Integration   Run only integration tests" -ForegroundColor Gray
    Write-Host "  .\run-tests.ps1 -Coverage      Run all tests with coverage" -ForegroundColor Gray
    Write-Host ""
}

# Main test execution
function Start-TestSuite {
    $startTime = Get-Date
    $failedTests = 0
    
    Write-Host ""
    Write-Status "Starting Medical Records System Test Suite..."
    Write-Host ""
    
    # Phase 1: Setup
    Write-Status "📋 PHASE 1: TEST ENVIRONMENT SETUP"
    Initialize-TestEnvironment
    Write-Host ""
    
    # Phase 2: Unit Tests
    Write-Status "🧪 PHASE 2: UNIT AND INTEGRATION TESTS"
    Write-Host ""
    
    # Test 1: Integration Tests
    if (!(Invoke-TestSuite "Integration Tests" "integration" 45000)) {
        $failedTests++
    }
    Write-Host ""
    
    # Test 2: Performance Tests
    if (!(Invoke-TestSuite "Performance Tests" "performance" 60000)) {
        $failedTests++
    }
    Write-Host ""
    
    # Test 3: Security & Access Control Tests
    if (!(Invoke-TestSuite "Security Tests" "security" 30000)) {
        $failedTests++
    }
    Write-Host ""
    
    # Test 4: Data Integrity Tests
    if (!(Invoke-TestSuite "Data Integrity Tests" "integrity" 40000)) {
        $failedTests++
    }
    Write-Host ""
    
    # Phase 3: End-to-End Tests
    Write-Status "🌐 PHASE 3: END-TO-END FUNCTIONALITY TESTS"
    Write-Host ""
    
    # Test 5: Medical Records API Tests
    if (!(Invoke-TestSuite "Medical Records API Tests" "medical.*api" 35000)) {
        $failedTests++
    }
    Write-Host ""
    
    # Phase 4: Regression Tests
    Write-Status "🔄 PHASE 4: REGRESSION AND COMPATIBILITY TESTS"
    Write-Host ""
    
    # Test 6: Backward Compatibility Tests
    Write-Status "Testing backward compatibility..."
    if (Invoke-TestSuite "Backward Compatibility Tests" "compatibility|legacy" 25000) {
        Write-Success "Backward compatibility tests passed"
    } else {
        Write-Error-Custom "Backward compatibility tests failed"
        $failedTests++
    }
    Write-Host ""
    
    # Phase 5: Load and Stress Tests
    Write-Status "⚡ PHASE 5: LOAD AND STRESS TESTS"
    Write-Host ""
    
    # Test 7: Load Tests
    if (!(Invoke-TestSuite "Load Tests" "load|concurrent" 90000)) {
        $failedTests++
    }
    Write-Host ""
    
    # Phase 6: Reports and Cleanup
    Write-Status "📊 PHASE 6: REPORT GENERATION AND CLEANUP"
    Write-Host ""
    
    New-TestReport
    Clear-TestEnvironment
    
    # Final results
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Status "TEST SUITE SUMMARY"
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "⏱️  Total execution time: $([math]::Round($duration))s" -ForegroundColor White
    Write-Host "🧪 Total test suites: 7" -ForegroundColor White
    Write-Host "❌ Failed test suites: $failedTests" -ForegroundColor White
    Write-Host "✅ Passed test suites: $(7 - $failedTests)" -ForegroundColor White
    Write-Host ""
    
    if ($failedTests -eq 0) {
        Write-Success "🎉 ALL TESTS PASSED! Medical Records System is ready for production."
        Write-Host ""
        Write-Status "✅ SUCCESS CRITERIA MET:"
        Write-Host "   • All existing functionality works unchanged" -ForegroundColor Green
        Write-Host "   • New medical record features work correctly" -ForegroundColor Green
        Write-Host "   • Role-based access control verified" -ForegroundColor Green
        Write-Host "   • Data integrity maintained" -ForegroundColor Green
        Write-Host "   • Performance requirements met" -ForegroundColor Green
        Write-Host "   • Security measures validated" -ForegroundColor Green
        Write-Host ""
        exit 0
    } else {
        Write-Error-Custom "🚨 TEST FAILURES DETECTED! Review failed test suites above."
        Write-Host ""
        Write-Status "🔧 RECOMMENDED ACTIONS:"
        Write-Host "   • Review failed test logs in test-reports/" -ForegroundColor Yellow
        Write-Host "   • Check backend and frontend error logs" -ForegroundColor Yellow
        Write-Host "   • Verify database connections and schemas" -ForegroundColor Yellow
        Write-Host "   • Re-run specific failed test suites" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
}

# Main execution logic
try {
    if ($Help) {
        Show-Help
        return
    }
    
    # Handle specific test suite requests
    if ($Integration) {
        Initialize-TestEnvironment
        Invoke-TestSuite "Integration Tests Only" "integration" 45000
        Clear-TestEnvironment
    } elseif ($Performance) {
        Initialize-TestEnvironment
        Invoke-TestSuite "Performance Tests Only" "performance" 60000
        Clear-TestEnvironment
    } elseif ($Security) {
        Initialize-TestEnvironment
        Invoke-TestSuite "Security Tests Only" "security" 30000
        Clear-TestEnvironment
    } elseif ($Integrity) {
        Initialize-TestEnvironment
        Invoke-TestSuite "Data Integrity Tests Only" "integrity" 40000
        Clear-TestEnvironment
    } elseif ($Coverage) {
        Initialize-TestEnvironment
        npm run test:coverage
        Clear-TestEnvironment
    } else {
        # Run full test suite
        Start-TestSuite
    }
} catch {
    Write-Error-Custom "Test execution failed: $_"
    Clear-TestEnvironment
    exit 1
}
