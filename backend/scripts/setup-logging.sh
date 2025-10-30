#!/bin/bash

echo "🔧 Configuration du système de logging pour Auth Starter"

# Créer les répertoires nécessaires
mkdir -p logs
mkdir -p filebeat
mkdir -p logstash/pipeline

# Installer Winston si pas déjà fait
echo "📦 Installation des dépendances de logging..."
npm install winston @types/winston

# Démarrer la stack ELK
echo "🚀 Démarrage de la stack ELK (Elasticsearch, Logstash, Kibana)..."
docker-compose -f docker-compose.logging.yml up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier que Elasticsearch est accessible
echo "🔍 Vérification d'Elasticsearch..."
curl -X GET "localhost:9200/_cluster/health?pretty"

# Créer l'index template pour les logs
echo "📋 Configuration de l'index Elasticsearch..."
curl -X PUT "localhost:9200/_index_template/auth-starter-logs" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["auth-starter-logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 1,
      "number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "event_type": { "type": "keyword" },
        "user_hash": { "type": "keyword" },
        "client_ip": { "type": "ip" },
        "severity": { "type": "keyword" },
        "log_type": { "type": "keyword" },
        "service": { "type": "keyword" },
        "environment": { "type": "keyword" }
      }
    }
  }
}'

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "🌐 Accès aux services :"
echo "   - Kibana (visualisation) : http://localhost:5601"
echo "   - Elasticsearch (API)    : http://localhost:9200"
echo ""
echo "📊 Pour voir les logs dans Kibana :"
echo "   1. Ouvrez http://localhost:5601"
echo "   2. Allez dans 'Stack Management' > 'Index Patterns'"
echo "   3. Créez un pattern 'auth-starter-logs-*'"
echo "   4. Allez dans 'Discover' pour voir les logs"
echo ""