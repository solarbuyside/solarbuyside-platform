#!/bin/bash
# Test all API endpoints with healthcheck and retry
# Usage: API_URL=http://localhost:5000 bash test-endpoints.sh

API_URL="${API_URL:-http://localhost:5000}"
TOKEN=""
PASS_COUNT=0
FAIL_COUNT=0

echo "🧪 Testing Solar Buy-Side API Endpoints"
echo "========================================="
echo "API URL: $API_URL"
echo ""

# Wait for service to be healthy
echo "⏳ Waiting for service to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null)
  if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Service is healthy!"
    echo ""
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   Retry $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Service failed to become healthy after $MAX_RETRIES attempts"
  echo "FAIL: Healthcheck timeout"
  exit 1
fi

# Helper function to test endpoint
test_endpoint() {
  local NAME="$1"
  local METHOD="$2"
  local URL="$3"
  local DATA="$4"
  local HEADERS="$5"
  local EXPECTED_STATUS="$6"

  echo "Testing: $NAME"

  if [ -z "$DATA" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" $HEADERS 2>/dev/null)
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" -H "Content-Type: application/json" $HEADERS -d "$DATA" 2>/dev/null)
  fi

  STATUS=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$STATUS" = "$EXPECTED_STATUS" ]; then
    echo "✅ PASS - Status: $STATUS"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "❌ FAIL - Expected: $EXPECTED_STATUS, Got: $STATUS"
    echo "   Response: $BODY"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  echo ""
}

# Test 1: Health check
test_endpoint "Health Check" "GET" "$API_URL/health" "" "" "200"

# Test 2: Login (should succeed with correct credentials)
echo "Testing: Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"testpass123"}' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "✅ PASS - Login successful"
  echo "   Token: ${TOKEN:0:20}..."
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "❌ FAIL - Login failed"
  echo "   Response: $LOGIN_RESPONSE"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo ""

# Test 3: Verify token
if [ ! -z "$TOKEN" ]; then
  test_endpoint "Verify Token" "GET" "$API_URL/api/auth/verify" "" "-H \"Authorization: Bearer $TOKEN\"" "200"
fi

# Test 4: Newsletter subscription (unique email each time)
UNIQUE_EMAIL="test-$(date +%s)@example.com"
test_endpoint "Newsletter Subscribe" "POST" "$API_URL/api/newsletter/subscribe" \
  "{\"email\":\"$UNIQUE_EMAIL\"}" "" "201"

# Test 5: Ebook lead (unique email each time)
UNIQUE_EMAIL="ebook-$(date +%s)@example.com"
test_endpoint "Ebook Lead Save" "POST" "$API_URL/api/ebook/save-lead" \
  "{\"nome\":\"Test\",\"sobrenome\":\"User\",\"email\":\"$UNIQUE_EMAIL\",\"celular\":\"11987654321\"}" "" "201"

# Test 6: Analytics event
SESSION_ID="test-session-$(date +%s)"
test_endpoint "Analytics Event" "POST" "$API_URL/api/analytics/event" \
  "{\"event_type\":\"page_view\",\"session_id\":\"$SESSION_ID\",\"page_url\":\"/\"}" "" "201"

# Test 7: Admin metrics (requires token)
if [ ! -z "$TOKEN" ]; then
  test_endpoint "Admin Metrics" "GET" "$API_URL/api/admin/metrics" "" "-H \"Authorization: Bearer $TOKEN\"" "200"
fi

# Test 8: Admin ebook leads (requires token)
if [ ! -z "$TOKEN" ]; then
  test_endpoint "Admin Ebook Leads" "GET" "$API_URL/api/admin/leads/ebook" "" "-H \"Authorization: Bearer $TOKEN\"" "200"
fi

# Test 9: Admin newsletter subscribers (requires token)
if [ ! -z "$TOKEN" ]; then
  test_endpoint "Admin Newsletter Subscribers" "GET" "$API_URL/api/admin/leads/newsletter" "" "-H \"Authorization: Bearer $TOKEN\"" "200"
fi

# Summary
echo "========================================="
echo "📊 Test Summary:"
echo "   Total: $((PASS_COUNT + FAIL_COUNT))"
echo "   ✅ Passed: $PASS_COUNT"
echo "   ❌ Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "💥 Some tests failed!"
  exit 1
fi
