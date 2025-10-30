const fs = require('fs');
const path = require('path');

// Créer le répertoire logs s'il n'existe pas
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Fonction pour générer des logs de test
function generateTestLogs() {
  const securityEvents = [
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '[SECURITY] AUTH_SUCCESS - User: hash_abc123 - IP: 192.168.1.* - Login successful',
      event_type: 'AUTH_SUCCESS',
      user_hash: 'hash_abc123',
      client_ip: '192.168.1.100',
      severity: 'low',
      log_type: 'security'
    },
    {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: '[SECURITY] AUTH_FAILURE - User: hash_def456 - IP: 10.0.0.* - Invalid password',
      event_type: 'AUTH_FAILURE',
      user_hash: 'hash_def456',
      client_ip: '10.0.0.50',
      severity: 'medium',
      log_type: 'security'
    },
    {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: '[SECURITY] SUSPICIOUS_ACTIVITY - User: hash_ghi789 - IP: 203.0.113.* - Multiple failed attempts',
      event_type: 'SUSPICIOUS_ACTIVITY',
      user_hash: 'hash_ghi789',
      client_ip: '203.0.113.25',
      severity: 'critical',
      log_type: 'security'
    },
    {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: '[SECURITY] REGISTRATION - User: hash_jkl012 - IP: 172.16.0.* - New user registered',
      event_type: 'REGISTRATION',
      user_hash: 'hash_jkl012',
      client_ip: '172.16.0.75',
      severity: 'low',
      log_type: 'security'
    },
    {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: '[SECURITY] PASSWORD_RESET_REQUEST - User: hash_mno345 - IP: 198.51.100.* - Password reset requested',
      event_type: 'PASSWORD_RESET_REQUEST',
      user_hash: 'hash_mno345',
      client_ip: '198.51.100.10',
      severity: 'medium',
      log_type: 'security'
    }
  ];

  // Écrire dans les fichiers de logs
  const securityLogPath = path.join(logsDir, 'security.log');
  const appLogPath = path.join(logsDir, 'app.log');

  securityEvents.forEach(event => {
    const logLine = JSON.stringify(event) + '\n';
    
    // Écrire dans security.log
    fs.appendFileSync(securityLogPath, logLine);
    
    // Écrire aussi dans app.log
    fs.appendFileSync(appLogPath, logLine);
  });

  console.log('✅ Logs de test générés avec succès !');
  console.log(`📁 Fichiers créés :`);
  console.log(`   - ${securityLogPath}`);
  console.log(`   - ${appLogPath}`);
  console.log('');
  console.log('📊 Événements générés :');
  securityEvents.forEach((event, index) => {
    console.log(`   ${index + 1}. ${event.event_type} (${event.severity})`);
  });
  console.log('');
  console.log('🔍 Pour voir les logs :');
  console.log('   - Fichiers : tail -f logs/security.log');
  console.log('   - Kibana : http://localhost:5601');
  console.log('   - Elasticsearch : http://localhost:9200/auth-starter-logs-*/_search');
}

// Générer les logs
generateTestLogs();