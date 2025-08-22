#!/bin/bash

# Medical Records System - Comprehensive Test Runner
# ✅ COMPREHENSIVE TEST SUITE according to safety plan

set -e  # Exit on any error

echo "🎯 Medical Records System - Comprehensive Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
export NODE_ENV=test
export TEST_VERBOSE=true
export FORCE_COLOR=1

# Function to print status
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to run test suite
run_test_suite() {
    local test_name="$1"
    local test_pattern="$2"
    local timeout="${3:-30000}"
    
    print_status "Running $test_name..."
    
    if npm test -- --testTimeout=$timeout --testPathPattern="$test_pattern"; then
        print_success "$test_name completed successfully"
        return 0
    else
        print_error "$test_name failed"
        return 1
    fi
}

# Function to setup test environment
setup_test_environment() {
    print_status "Setting up test environment..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Seed test data
    print_status "Seeding test data..."
    npm run seed:test-data || print_warning "Test data seeding failed - continuing anyway"
    
    print_success "Test environment ready"
}

# Function to cleanup test environment
cleanup_test_environment() {
    print_status "Cleaning up test environment..."
    npm run cleanup:test-data || print_warning "Test data cleanup failed"
    print_success "Test environment cleaned"
}

# Function to generate test report
generate_test_report() {
    print_status "Generating comprehensive test report..."
    
    # Create test report directory
    mkdir -p test-reports
    
    # Generate coverage report
    npm run test:coverage -- --coverageDirectory=test-reports/coverage || print_warning "Coverage report failed"
    
    # Generate detailed test results
    npm test -- --verbose --outputFile=test-reports/test-results.json --json || print_warning "JSON report failed"
    
    print_success "Test reports generated in test-reports/"
}

# Main test execution
main() {
    local start_time=$(date +%s)
    local failed_tests=0
    
    echo
    print_status "Starting Medical Records System Test Suite..."
    echo
    
    # Phase 1: Setup
    print_status "📋 PHASE 1: TEST ENVIRONMENT SETUP"
    setup_test_environment
    echo
    
    # Phase 2: Unit Tests
    print_status "🧪 PHASE 2: UNIT AND INTEGRATION TESTS"
    echo
    
    # Test 1: Integration Tests
    if ! run_test_suite "Integration Tests" "integration" 45000; then
        ((failed_tests++))
    fi
    echo
    
    # Test 2: Performance Tests
    if ! run_test_suite "Performance Tests" "performance" 60000; then
        ((failed_tests++))
    fi
    echo
    
    # Test 3: Security & Access Control Tests
    if ! run_test_suite "Security Tests" "security" 30000; then
        ((failed_tests++))
    fi
    echo
    
    # Test 4: Data Integrity Tests
    if ! run_test_suite "Data Integrity Tests" "integrity" 40000; then
        ((failed_tests++))
    fi
    echo
    
    # Phase 3: End-to-End Tests
    print_status "🌐 PHASE 3: END-TO-END FUNCTIONALITY TESTS"
    echo
    
    # Test 5: Medical Records API Tests
    if ! run_test_suite "Medical Records API Tests" "medical.*api" 35000; then
        ((failed_tests++))
    fi
    echo
    
    # Phase 4: Regression Tests
    print_status "🔄 PHASE 4: REGRESSION AND COMPATIBILITY TESTS"
    echo
    
    # Test 6: Backward Compatibility Tests
    print_status "Testing backward compatibility..."
    if npm test -- --testTimeout=25000 --testPathPattern="compatibility|legacy"; then
        print_success "Backward compatibility tests passed"
    else
        print_error "Backward compatibility tests failed"
        ((failed_tests++))
    fi
    echo
    
    # Phase 5: Load and Stress Tests
    print_status "⚡ PHASE 5: LOAD AND STRESS TESTS"
    echo
    
    # Test 7: Load Tests
    if ! run_test_suite "Load Tests" "load|concurrent" 90000; then
        ((failed_tests++))
    fi
    echo
    
    # Phase 6: Reports and Cleanup
    print_status "📊 PHASE 6: REPORT GENERATION AND CLEANUP"
    echo
    
    generate_test_report
    cleanup_test_environment
    
    # Final results
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo
    echo "=================================================="
    print_status "TEST SUITE SUMMARY"
    echo "=================================================="
    echo "⏱️  Total execution time: ${duration}s"
    echo "🧪 Total test suites: 7"
    echo "❌ Failed test suites: $failed_tests"
    echo "✅ Passed test suites: $((7 - failed_tests))"
    echo
    
    if [ $failed_tests -eq 0 ]; then
        print_success "🎉 ALL TESTS PASSED! Medical Records System is ready for production."
        echo
        print_status "✅ SUCCESS CRITERIA MET:"
        echo "   • All existing functionality works unchanged"
        echo "   • New medical record features work correctly"
        echo "   • Role-based access control verified"
        echo "   • Data integrity maintained"
        echo "   • Performance requirements met"
        echo "   • Security measures validated"
        echo
        exit 0
    else
        print_error "🚨 TEST FAILURES DETECTED! Review failed test suites above."
        echo
        print_status "🔧 RECOMMENDED ACTIONS:"
        echo "   • Review failed test logs in test-reports/"
        echo "   • Check backend and frontend error logs"
        echo "   • Verify database connections and schemas"
        echo "   • Re-run specific failed test suites"
        echo
        exit 1
    fi
}

# Handle script interruption
trap cleanup_test_environment EXIT INT TERM

# Show help if requested
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "Medical Records System Test Runner"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --integration       Run only integration tests"
    echo "  --performance       Run only performance tests"
    echo "  --security          Run only security tests"
    echo "  --integrity         Run only data integrity tests"
    echo "  --coverage          Run with coverage report"
    echo "  --verbose           Run with verbose output"
    echo
    echo "Examples:"
    echo "  $0                  Run all test suites"
    echo "  $0 --integration    Run only integration tests"
    echo "  $0 --coverage       Run all tests with coverage"
    echo
    exit 0
fi

# Handle specific test suite requests
case "$1" in
    --integration)
        setup_test_environment
        run_test_suite "Integration Tests Only" "integration" 45000
        cleanup_test_environment
        ;;
    --performance)
        setup_test_environment
        run_test_suite "Performance Tests Only" "performance" 60000
        cleanup_test_environment
        ;;
    --security)
        setup_test_environment
        run_test_suite "Security Tests Only" "security" 30000
        cleanup_test_environment
        ;;
    --integrity)
        setup_test_environment
        run_test_suite "Data Integrity Tests Only" "integrity" 40000
        cleanup_test_environment
        ;;
    --coverage)
        setup_test_environment
        npm run test:coverage
        cleanup_test_environment
        ;;
    *)
        # Run full test suite
        main
        ;;
esac
