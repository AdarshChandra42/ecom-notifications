// This script will be executed when MongoDB container is first initialized
db = db.getSiblingDB('user-service');
db.createUser({
  user: 'user_service_user',
  pwd: 'user_service_password',
  roles: [{ role: 'readWrite', db: 'user-service' }]
});

db = db.getSiblingDB('notification-service');
db.createUser({
  user: 'notification_service_user',
  pwd: 'notification_service_password',
  roles: [{ role: 'readWrite', db: 'notification-service' }]
});

db = db.getSiblingDB('recommendation-service');
db.createUser({
  user: 'recommendation_service_user',
  pwd: 'recommendation_service_password',
  roles: [{ role: 'readWrite', db: 'recommendation-service' }]
});
