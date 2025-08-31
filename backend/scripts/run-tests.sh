#!/bin/bash

# scripts/run-tests.sh
# Test runner script with environment validation

echo "🧪 Hospital Management System - Test Runner"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_status $RED "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Step 1: Check environment configuration
print_status $YELLOW "🔍 Step 1: Checking environment configuration..."
node scripts/check-env.js
if [ $? -ne 0 ]; then
    print_status $RED "❌ Environment check failed. Please fix configuration."
    exit 1
fi

print_status $GREEN "✅ Environment configuration is valid"
echo ""

# Step 2: Setup test database
print_status $YELLOW "🔧 Step 2: Setting up test database..."
node scripts/checkDatabase.js
if [ $? -ne 0 ]; then
    print_status $RED "❌ Test database setup failed"
    exit 1
fi

print_status $GREEN "✅ Test database is ready"
echo ""

# Step 3: Run tests based on argument
TEST_TYPE=${1:-"e2e"}

case $TEST_TYPE in
    "unit")
        print_status $YELLOW "🧪 Step 3: Running unit tests..."
        npm run test:unit
        ;;
    "integration")
        print_status $YELLOW "🧪 Step 3: Running integration tests..."
        npm run test:integration
        ;;
    "e2e")
        print_status $YELLOW "🧪 Step 3: Running E2E tests..."
        npm run test:e2e
        ;;
    "all")
        print_status $YELLOW "🧪 Step 3: Running all tests..."
        npm run test:all
        ;;
    "coverage")
        print_status $YELLOW "🧪 Step 3: Running tests with coverage..."
        npm run test:coverage
        ;;
    *)
        print_status $YELLOW "🧪 Step 3: Running E2E tests (default)..."
        npm run test:e2e
        ;;
esac

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_status $GREEN "✅ All tests completed successfully!"
else
    print_status $RED "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
    exit $TEST_EXIT_CODE
fi

echo ""
print_status $YELLOW "📊 Test Summary:"
echo "- Test type: $TEST_TYPE"
echo "- Environment: $(node -p 'process.env.NODE_ENV || \"development\"')"
echo "- Database: Test database (isolated)"
echo ""
print_status $GREEN "🎉 Test run complete!"