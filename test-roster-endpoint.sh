#!/bin/bash

# Test the optimized roster endpoint

# Step 1: Get auth token
echo "Getting auth token..."
TOKEN_RESPONSE=$(curl -s -X POST "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:i6a062_x/auth/test-login" \
  -H "Content-Type: application/json" \
  -d '{
  "email": "dave@premieregrp.com",
  "password": "Password123!"
}')

echo "Token response: $TOKEN_RESPONSE"
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"authToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get auth token"
  echo "$TOKEN_RESPONSE"
  exit 1
fi

echo "Got token: ${TOKEN:0:20}..."

# Step 2: Test roster endpoint with timing
echo -e "\nTesting roster endpoint..."
START_TIME=$(date +%s)

RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" \
  -X GET "https://x2nu-xcjc-vhax.agentdashboards.xano.io/api:pe1wjL5I/team_management/roster?team_id=1" \
  -H "Authorization: Bearer $TOKEN" \
  --max-time 30)

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Extract body, status code, and time from response
BODY=$(echo "$RESPONSE" | head -n -2)
STATUS=$(echo "$RESPONSE" | tail -n 2 | head -n 1)
TIME=$(echo "$RESPONSE" | tail -n 1)

echo "HTTP Status: $STATUS"
echo "Response Time: ${TIME}s (wall clock: ${DURATION}s)"
echo "Response length: $(echo "$BODY" | wc -c) bytes"

if [ "$STATUS" = "200" ]; then
  RECORD_COUNT=$(echo "$BODY" | grep -o '\[' | wc -l)
  echo "SUCCESS! Returned $RECORD_COUNT records"
  echo "First record:"
  echo "$BODY" | head -c 500
else
  echo "FAILED!"
  echo "$BODY"
fi
