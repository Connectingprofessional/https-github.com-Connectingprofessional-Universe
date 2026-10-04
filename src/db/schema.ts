import { pgTable, serial, text, timestamp, doublePrecision, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tracking sessions
export const trackingSessions = pgTable('tracking_sessions', {
  id: text('id').primaryKey(), // UUID
  userUid: text('user_uid').references(() => users.uid),
  name: text('name').default('Live Tracking Session'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  stoppedAt: timestamp('stopped_at'),
});

// Location points logged during tracking sessions
export const locationPoints = pgTable('location_points', {
  id: text('id').primaryKey(), // UUID
  sessionId: text('session_id').references(() => trackingSessions.id).notNull(),
  lat: doublePrecision('lat').notNull(),
  lon: doublePrecision('lon').notNull(),
  accuracyM: doublePrecision('accuracy_m'),
  altitudeM: doublePrecision('altitude_m'),
  headingDeg: doublePrecision('heading_deg'),
  speedMps: doublePrecision('speed_mps'),
  source: text('source').default('gps'),
  recordedAt: timestamp('recorded_at').defaultNow(),
});

// Geofences
export const geofences = pgTable('geofences', {
  id: text('id').primaryKey(), // UUID
  sessionId: text('session_id').references(() => trackingSessions.id),
  name: text('name').notNull(),
  lat: doublePrecision('lat').notNull(),
  lon: doublePrecision('lon').notNull(),
  radiusM: integer('radius_m').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Friends & Family authorized connections
export const friends = pgTable('friends', {
  id: text('id').primaryKey(), // UUID
  userUid: text('user_uid').references(() => users.uid),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  status: text('status').default('Online'),
  lat: doublePrecision('lat'),
  lon: doublePrecision('lon'),
  speedKmh: doublePrecision('speed_kmh').default(0),
  battery: integer('battery').default(100),
  lastSeen: text('last_seen').default('Just now'),
  online: text('online').default('true'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(trackingSessions),
  friends: many(friends),
}));

export const trackingSessionsRelations = relations(trackingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [trackingSessions.userUid],
    references: [users.uid],
  }),
  points: many(locationPoints),
  geofences: many(geofences),
}));

export const locationPointsRelations = relations(locationPoints, ({ one }) => ({
  session: one(trackingSessions, {
    fields: [locationPoints.sessionId],
    references: [trackingSessions.id],
  }),
}));
