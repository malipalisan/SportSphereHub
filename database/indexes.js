db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1, status: 1 });
db.users.createIndex({ organizationId: 1 });

db.organizations.createIndex({ registrationNumber: 1 }, { unique: true });
db.organizations.createIndex({ taxId: 1 }, { unique: true });

db.sports.createIndex({ name: 1 }, { unique: true });
db.sports.createIndex({ active: 1 });

db.facilities.createIndex({ status: 1, city: 1 });
db.facilities.createIndex({ sportIds: 1 });
db.facilities.createIndex({ name: "text", city: "text", description: "text" });
db.facilities.createIndex({ organizationId: 1 });

db.resources.createIndex({ facilityId: 1, name: 1 }, { unique: true });
db.resources.createIndex({ facilityId: 1, type: 1, active: 1 });
db.resources.createIndex({ sportIds: 1 });

db.reservations.createIndex({ resourceId: 1, startAt: 1, endAt: 1, status: 1 });
db.reservations.createIndex({ athleteId: 1, startAt: -1 });
db.reservations.createIndex({ facilityId: 1, status: 1 });

db.promotions.createIndex({ active: 1, validFrom: 1, validTo: 1 });
db.promotions.createIndex({ facilityId: 1, sportId: 1 });

db.reactions.createIndex({ reservationId: 1 }, { unique: true });
db.reactions.createIndex({ facilityId: 1, createdAt: -1 });
db.reactions.createIndex({ athleteId: 1, facilityId: 1 });

db.teammateAds.createIndex({ status: 1, city: 1, sportId: 1, startAt: 1 });
db.trainers.createIndex({ facilityId: 1, sportIds: 1, active: 1 });
db.trainingSessions.createIndex({ trainerId: 1, startAt: 1, endAt: 1, status: 1 });
db.equipment.createIndex({ facilityId: 1, sportId: 1, active: 1 });
db.orders.createIndex({ athleteId: 1, status: 1, createdAt: -1 });
db.passwordResetTokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.passwordResetTokens.createIndex({ userId: 1, usedAt: 1 });

print("SportSphere Hub indexes created.");

