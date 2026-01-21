import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function getCommunityBySlug(slug: string) {
  const result = await db.execute(sql`
    WITH base_community AS (
      SELECT
        l.location_id,
        l.name,
        l.slug,
        l.level,
        cp.description,
        cp.lifestyle_summary,
        cp.population_estimate
      FROM locations l
      LEFT JOIN community_profiles cp
        ON cp.location_id = l.location_id
      WHERE l.slug = ${slug}
      LIMIT 1
    ),

    images AS (
      SELECT
        cm.location_id,
        json_agg(
          json_build_object(
            'id', cm.media_id,
            'url', cm.media_url,
            'mediaType', cm.media_type,
            'source', cm.source,
            'isPrimary', cm.is_primary
          )
          ORDER BY cm.is_primary DESC, cm.created_at DESC
        ) AS images
      FROM community_media cm
      GROUP BY cm.location_id
    ),

    amenities AS (
      SELECT
        ca.location_id,
        json_agg(
          json_build_object(
            'id', a.amenity_id,
            'name', a.name
          )
        ) AS amenities
      FROM community_amenities ca
      JOIN amenities_community a
        ON a.amenity_id = ca.amenity_id
      GROUP BY ca.location_id
    ),

    roads AS (
      SELECT
        cr.location_id,
        json_agg(
          json_build_object(
            'id', r.road_id,
            'name', r.name
          )
        ) AS roads
      FROM community_roads cr
      JOIN roads r
        ON r.road_id = cr.road_id
      GROUP BY cr.location_id
    ),

    classifications AS (
      SELECT
        csc.location_id,
        json_agg(
          json_build_object(
            'id', csc.classification_id,
            'title', csc.title,
            'type', csc.classification_type,
            'description', csc.description
          )
        ) AS classifications
      FROM community_special_classifications csc
      GROUP BY csc.location_id
    ),

    narratives AS (
      SELECT
        cn.location_id,
        json_object_agg(
          cn.narrative_type,
          json_build_object(
            'content', cn.content,
            'confidenceScore', cn.confidence_score,
            'timeHorizon', cn.time_horizon,
            'generatedBy', cn.generated_by,
            'generatedAt', cn.generated_at
          )
        ) AS narratives
      FROM community_narratives cn
      WHERE cn.is_active = TRUE
      GROUP BY cn.location_id
    ),

    accessibility AS (
      SELECT
        ca.location_id,
        json_build_object(
          'coordinates', json_build_object(
            'latitude', ca.latitude,
            'longitude', ca.longitude
          ),
          'nearestMetro', json_build_object(
            'name', ca.nearest_metro,
            'distanceKm', ca.metro_distance_km
          ),
          'keyDistances', json_build_object(
            'downtownKm', ca.distance_to_downtown_km,
            'businessBayKm', ca.distance_to_business_bay_km,
            'airportKm', ca.distance_to_airport_km
          ),
          'majorRoads', ca.major_roads,
          'areaDistances', ca.accessibility_distances
        ) AS accessibility
      FROM community_accessibility ca
    )

    SELECT
      bc.*,
      COALESCE(img.images, '[]') AS images,
      COALESCE(a.amenities, '[]') AS amenities,
      COALESCE(r.roads, '[]') AS roads,
      COALESCE(c.classifications, '[]') AS classifications,
      COALESCE(n.narratives, '{}'::json) AS narratives,
      acc.accessibility
    FROM base_community bc
    LEFT JOIN images img ON img.location_id = bc.location_id
    LEFT JOIN amenities a ON a.location_id = bc.location_id
    LEFT JOIN roads r ON r.location_id = bc.location_id
    LEFT JOIN classifications c ON c.location_id = bc.location_id
    LEFT JOIN narratives n ON n.location_id = bc.location_id
    LEFT JOIN accessibility acc ON acc.location_id = bc.location_id;
  `);

  return result[0] ?? null;
}
