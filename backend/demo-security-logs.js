#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🔐 DÉMONSTRATION DU SYSTÈME DE LOGS DE SÉCURITÉ');
console.log('================================================\n');

async function runQuery(description, query) {
  console.log(`📊 ${description}`);
  console.log('─'.repeat(50));
  
  try {
    const { stdout } = await execAsync(`curl -s -X GET "http://localhost:9200/auth-starter-logs-*/_search?pretty" -H 'Content-Type: application/json' -d '${JSON.stringify(query)}'`);
    const result = JSON.parse(stdout);
    
    if (result.hits && result.hits.hits.length > 0) {
      result.hits.hits.forEach((hit, index) => {
        const source = hit._source;
        console.log(`${index + 1}. [${source.level?.toUpperCase()}] ${source.event_type} - ${source.severity}`);
        console.log(`   👤 User: ${source.user_hash}`);
        console.log(`   🌐 IP: ${source.client_ip}`);
        console.log(`   📝 Message: ${source.message}`);
        console.log(`   ⏰ Time: ${source.timestamp}`);
        console.log('');
      });
    } else {
      console.log('   Aucun résultat trouvé.\n');
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }
}

async function showStats() {
  console.log('📈 STATISTIQUES GÉNÉRALES');
  console.log('─'.repeat(50));
  
  try {
    // Nombre total de logs
    const { stdout: totalLogs } = await execAsync(`curl -s "http://localhost:9200/auth-starter-logs-*/_count"`);
    const total = JSON.parse(totalLogs);
    console.log(`📊 Total des logs: ${total.count}`);
    
    // Répartition par sévérité
    const { stdout: severityStats } = await execAsync(`curl -s -X GET "http://localhost:9200/auth-starter-logs-*/_search?size=0&pretty" -H 'Content-Type: application/json' -d '{"aggs": {"severity_count": {"terms": {"field": "severity.keyword"}}}}'`);
    const severityResult = JSON.parse(severityStats);
    
    if (severityResult.aggregations && severityResult.aggregations.severity_count) {
      console.log('📊 Répartition par sévérité:');
      severityResult.aggregations.severity_count.buckets.forEach(bucket => {
        console.log(`   ${bucket.key}: ${bucket.doc_count} événements`);
      });
    }
    
    console.log('');
  } catch (error) {
    console.log(`❌ Erreur lors du calcul des statistiques: ${error.message}\n`);
  }
}

async function main() {
  // Vérifier que Elasticsearch est accessible
  try {
    await execAsync('curl -s http://localhost:9200/_cluster/health');
    console.log('✅ Elasticsearch est accessible\n');
  } catch (error) {
    console.log('❌ Elasticsearch n\'est pas accessible. Assurez-vous que les services ELK sont démarrés.\n');
    return;
  }
  
  // Statistiques générales
  await showStats();
  
  // Requêtes de démonstration
  await runQuery(
    'ÉVÉNEMENTS CRITIQUES (Activités suspectes)',
    {
      query: { match: { severity: 'critical' } },
      size: 5,
      sort: [{ '@timestamp': { order: 'desc' } }]
    }
  );
  
  await runQuery(
    'ÉCHECS D\'AUTHENTIFICATION',
    {
      query: { match: { event_type: 'AUTH_FAILURE' } },
      size: 3,
      sort: [{ '@timestamp': { order: 'desc' } }]
    }
  );
  
  await runQuery(
    'CONNEXIONS RÉUSSIES',
    {
      query: { match: { event_type: 'AUTH_SUCCESS' } },
      size: 3,
      sort: [{ '@timestamp': { order: 'desc' } }]
    }
  );
  
  await runQuery(
    'ACTIVITÉS PAR ADRESSE IP SPÉCIFIQUE (203.0.113.*)',
    {
      query: { wildcard: { client_ip: '203.0.113.*' } },
      size: 5,
      sort: [{ '@timestamp': { order: 'desc' } }]
    }
  );
  
  console.log('🔗 ACCÈS AUX INTERFACES');
  console.log('─'.repeat(50));
  console.log('🌐 Kibana (Interface graphique): http://localhost:5601');
  console.log('🔍 Elasticsearch (API): http://localhost:9200');
  console.log('📁 Logs locaux: ./logs/');
  console.log('');
  
  console.log('💡 COMMANDES UTILES');
  console.log('─'.repeat(50));
  console.log('• Voir les logs en temps réel: tail -f logs/security.log');
  console.log('• Recherche dans Elasticsearch: curl "http://localhost:9200/auth-starter-logs-*/_search?q=severity:critical"');
  console.log('• Statut des services: docker-compose -f docker-compose.logging.yml ps');
  console.log('• Arrêter les services: docker-compose -f docker-compose.logging.yml down');
  console.log('');
  
  console.log('✅ Démonstration terminée !');
}

main().catch(console.error);