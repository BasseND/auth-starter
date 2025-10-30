# 📊 Guide d'accès aux logs de sécurité

## 🏠 Environnement local (développement)

### Console du serveur
Les logs apparaissent directement dans votre terminal :

```bash
npm run start:dev
```

**Format des logs :**
```
[SECURITY] AUTH_SUCCESS - User: hash_abc123 - IP: 192.168.*.* - 
[SECURITY] LOGIN_INVALID_PASSWORD - User: hash_def456 - IP: 192.168.*.* - 
```

### Niveaux de logs
- 🔴 **ERROR** : Erreurs critiques (compte bloqué, erreurs système)
- 🟡 **WARN** : Tentatives suspectes (mauvais mot de passe, tokens invalides)
- ⚪ **LOG** : Événements normaux (connexions réussies, inscriptions)
- 🔍 **DEBUG** : Informations détaillées

---

## 🚀 Environnement de production

### 1. Configuration des variables d'environnement

```bash
# .env
NODE_ENV=production
LOG_LEVEL=info
LOG_TO_FILE=true
```

### 2. Fichiers de logs

Les logs sont automatiquement écrits dans :
- `logs/app.log` - Logs généraux
- `logs/error.log` - Logs d'erreur uniquement
- `logs/security.log` - Logs de sécurité uniquement

### 3. Stack ELK complète (recommandé)

#### Installation rapide
```bash
# Donner les permissions d'exécution
chmod +x scripts/setup-logging.sh

# Lancer l'installation
./scripts/setup-logging.sh
```

#### Services disponibles
- **Elasticsearch** (http://localhost:9200) - Stockage des logs
- **Kibana** (http://localhost:5601) - Interface de visualisation
- **Logstash** - Traitement des logs
- **Filebeat** - Collection des logs

#### Accès à Kibana
1. Ouvrez http://localhost:5601
2. Allez dans **Stack Management** > **Index Patterns**
3. Créez un pattern `auth-starter-logs-*`
4. Allez dans **Discover** pour voir les logs en temps réel

---

## 🔍 Recherche et filtrage des logs

### Dans Kibana

#### Filtres utiles :
```
# Tous les événements de sécurité
log_type: "security"

# Tentatives de connexion échouées
event_type: "AUTH_FAILURE"

# Activités suspectes
severity: "critical"

# Logs d'une IP spécifique
client_ip: "192.168.1.100"

# Événements des dernières 24h
@timestamp: [now-24h TO now]
```

#### Requêtes KQL (Kibana Query Language) :
```
# Combinaison de filtres
log_type: "security" AND severity: "high" AND @timestamp: [now-1h TO now]

# Recherche par type d'événement
event_type: ("AUTH_FAILURE" OR "SUSPICIOUS_ACTIVITY")

# Exclure certains événements
NOT event_type: "AUTH_SUCCESS"
```

### Via les fichiers de logs

```bash
# Voir les logs de sécurité en temps réel
tail -f logs/security.log

# Rechercher des tentatives de connexion échouées
grep "AUTH_FAILURE" logs/security.log

# Compter les événements par type
grep -o '"event_type":"[^"]*"' logs/security.log | sort | uniq -c

# Logs des dernières 24h avec jq
cat logs/security.log | jq 'select(.timestamp > (now - 86400))'
```

---

## 📈 Dashboards et alertes

### Dashboards Kibana recommandés

1. **Dashboard Sécurité** :
   - Nombre de tentatives de connexion par heure
   - Top 10 des IP suspectes
   - Répartition des types d'événements
   - Géolocalisation des connexions

2. **Dashboard Monitoring** :
   - Taux d'erreur par endpoint
   - Temps de réponse moyen
   - Nombre d'utilisateurs actifs

### Alertes automatiques

Configurez des alertes pour :
- Plus de 5 tentatives de connexion échouées en 5 minutes
- Activité suspecte détectée
- Erreurs système critiques
- Dépassement de limite de taux

---

## 🔧 Configuration avancée

### Rotation des logs

Ajoutez dans votre `package.json` :
```json
{
  "scripts": {
    "logs:rotate": "find logs -name '*.log' -size +100M -exec gzip {} \\;",
    "logs:clean": "find logs -name '*.gz' -mtime +30 -delete"
  }
}
```

### Intégration avec des services externes

#### Sentry (erreurs)
```typescript
// Dans secure-logger.service.ts
import * as Sentry from '@sentry/node';

private sendToSentry(event: SecurityEvent) {
  if (event.type.includes('ERROR')) {
    Sentry.captureMessage(`Security Event: ${event.type}`, 'error');
  }
}
```

#### Slack (alertes)
```typescript
private async sendSlackAlert(event: SecurityEvent) {
  if (event.type === 'SUSPICIOUS_ACTIVITY') {
    // Envoyer notification Slack
  }
}
```

---

## 🚨 Surveillance en temps réel

### Commandes utiles

```bash
# Surveiller les logs en temps réel
docker-compose -f docker-compose.logging.yml logs -f

# Vérifier l'état des services
docker-compose -f docker-compose.logging.yml ps

# Redémarrer un service
docker-compose -f docker-compose.logging.yml restart kibana
```

### Métriques importantes à surveiller

- Nombre de tentatives de connexion par minute
- Taux d'échec des authentifications
- Nombre d'IP uniques par heure
- Temps de réponse des endpoints d'auth
- Utilisation mémoire/CPU des services de logging

---

## 📋 Checklist de production

- [ ] Variables d'environnement configurées
- [ ] Rotation des logs activée
- [ ] Dashboards Kibana créés
- [ ] Alertes configurées
- [ ] Sauvegarde des logs planifiée
- [ ] Monitoring des services ELK
- [ ] Documentation équipe mise à jour