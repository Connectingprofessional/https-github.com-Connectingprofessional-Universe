import { db } from './index.ts';
import { trackingSessions, locationPoints, geofences, friends } from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export async function createSession(id: string, userUid?: string, name?: string) {
  try {
    const result = await db.insert(trackingSessions)
      .values({
        id,
        userUid: userUid || null,
        name: name || 'Live Tracking Session',
        status: 'active',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in createSession:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function addLocation(point: {
  id: string;
  sessionId: string;
  lat: number;
  lon: number;
  accuracyM?: number | null;
  altitudeM?: number | null;
  headingDeg?: number | null;
  speedMps?: number | null;
  source?: string;
  recordedAt?: Date;
}) {
  try {
    const result = await db.insert(locationPoints)
      .values({
        id: point.id,
        sessionId: point.sessionId,
        lat: point.lat,
        lon: point.lon,
        accuracyM: point.accuracyM ?? null,
        altitudeM: point.altitudeM ?? null,
        headingDeg: point.headingDeg ?? null,
        speedMps: point.speedMps ?? null,
        source: point.source || 'gps',
        recordedAt: point.recordedAt || new Date(),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in addLocation:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getSessionHistory(sessionId: string) {
  try {
    return await db.select()
      .from(locationPoints)
      .where(eq(locationPoints.sessionId, sessionId))
      .orderBy(locationPoints.recordedAt);
  } catch (error) {
    console.error('Database query failed in getSessionHistory:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function stopSession(sessionId: string) {
  try {
    const result = await db.update(trackingSessions)
      .set({
        status: 'stopped',
        stoppedAt: new Date(),
      })
      .where(eq(trackingSessions.id, sessionId))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in stopSession:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getGeofenceList(sessionId?: string) {
  try {
    if (sessionId) {
      return await db.select().from(geofences).where(eq(geofences.sessionId, sessionId));
    }
    return await db.select().from(geofences);
  } catch (error) {
    console.error('Database query failed in getGeofenceList:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertGeofence(g: {
  id: string;
  sessionId?: string | null;
  name: string;
  lat: number;
  lon: number;
  radiusM: number;
}) {
  try {
    const result = await db.insert(geofences)
      .values({
        id: g.id,
        sessionId: g.sessionId || null,
        name: g.name,
        lat: g.lat,
        lon: g.lon,
        radiusM: g.radiusM,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in insertGeofence:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function removeGeofence(id: string) {
  try {
    await db.delete(geofences).where(eq(geofences.id, id));
  } catch (error) {
    console.error('Database query failed in removeGeofence:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getFriendsList(userUid?: string) {
  try {
    if (userUid) {
      return await db.select().from(friends).where(eq(friends.userUid, userUid));
    }
    return await db.select().from(friends);
  } catch (error) {
    console.error('Database query failed in getFriendsList:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
