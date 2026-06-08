#!/bin/bash
# Teste simples para verificar contagem de pages_visited

API_URL="${API_URL:-http://localhost:5000}"
TEST_SESSION="test-session-$(date +%s)"

echo "🧪 Testando contagem de pages_visited..."
echo "Session ID: $TEST_SESSION"
echo ""

# Teste 1: Enviar 2 page_view
echo "📄 Teste 1: Enviando 2 eventos page_view"
curl -s -X POST "$API_URL/api/analytics/event" \
  -H "Content-Type: application/json" \
  -d "{\"event_type\":\"page_view\",\"session_id\":\"$TEST_SESSION\",\"page_url\":\"/\"}" > /dev/null

curl -s -X POST "$API_URL/api/analytics/event" \
  -H "Content-Type: application/json" \
  -d "{\"event_type\":\"page_view\",\"session_id\":\"$TEST_SESSION\",\"page_url\":\"/about\"}" > /dev/null

echo "✅ Enviados 2 page_view"
echo "   Esperado: pages_visited = 2"
echo ""

# Teste 2: Enviar 2 eventos diferentes (não page_view)
echo "📊 Teste 2: Enviando 2 eventos diferentes (section_view, buy_click)"
curl -s -X POST "$API_URL/api/analytics/event" \
  -H "Content-Type: application/json" \
  -d "{\"event_type\":\"section_view\",\"session_id\":\"$TEST_SESSION\",\"section_name\":\"hero\"}" > /dev/null

curl -s -X POST "$API_URL/api/analytics/event" \
  -H "Content-Type: application/json" \
  -d "{\"event_type\":\"buy_click\",\"session_id\":\"$TEST_SESSION\"}" > /dev/null

echo "✅ Enviados 2 eventos diferentes"
echo "   Esperado: pages_visited ainda = 2 (não incrementa)"
echo ""

# Verificar resultado
echo "🔍 Verificando resultado no banco..."
echo "   Query: SELECT pages_visited FROM analytics_sessions WHERE session_id = '$TEST_SESSION'"
echo ""
echo "⚠️  Execute manualmente no MySQL para verificar:"
echo "   mysql -u user -p -e \"SELECT pages_visited FROM analytics_sessions WHERE session_id = '$TEST_SESSION';\""
echo ""
echo "✅ Teste concluído!"
