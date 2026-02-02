import { sql } from "drizzle-orm";
import { db } from "@/db";
// import { db_demo_projects } from "@/db";

/**
 * Retrieves comprehensive project details by project name.
 * Includes developer, location, status, amenities, images, unit categories,
 * payment plans, timeline, agencies, gallery/media, sales history, and description.
 */
export async function getProjectDetailsByName(projectName: string) {
  const result = await db.execute(sql`
    WITH 
    -- Core project data (includes description column)
    project_base AS (
      SELECT
        p.project_id,
        p.project_name,
        p.project_url,
        p.source,
        p.source_project_id,
        p.latitude,
        p.longitude,
        p.raw_location_name,
        p.construction_phase,
        p.sales_phase,
        p.stock_availability,
        p.starting_price,
        p.down_payment_percentage,
        p.hotness_level,
        p.delivery_date,
        p.location_id,
        p.developer_id,
        p.description,
        p.description_scraped_at
      FROM projects p
      WHERE p.project_name = ${projectName}
    ),

    -- Amenities aggregation
    project_amenities_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL),
          '[]'::jsonb
        ) AS amenities
      FROM project_base pb
      LEFT JOIN project_amenities pa ON pa.project_id = pb.project_id
      LEFT JOIN amenities a ON a.amenity_id = pa.amenity_id
      GROUP BY pb.project_id
    ),

    -- Project images
    project_images_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object('image_url', pi.image_url)
            ORDER BY pi.image_url
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          '[]'::jsonb
        ) AS images
      FROM project_base pb
      LEFT JOIN project_images pi ON pi.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Property types
    property_types_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(ppt.property_type ORDER BY ppt.property_type) 
          FILTER (WHERE ppt.property_type IS NOT NULL),
          '[]'::jsonb
        ) AS property_types
      FROM project_base pb
      LEFT JOIN project_property_types ppt ON ppt.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Bedroom counts
    bedroom_counts_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(pb2.bedroom_count ORDER BY pb2.bedroom_count) 
          FILTER (WHERE pb2.bedroom_count IS NOT NULL),
          '[]'::jsonb
        ) AS bedroom_counts
      FROM project_base pb
      LEFT JOIN project_bedrooms pb2 ON pb2.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Unit categories with layouts and floor plans
    unit_categories_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'unit_category_id', uc.unit_category_id,
              'property_type', uc.property_type,
              'bedrooms', uc.bedrooms,
              'area', jsonb_build_object('from', uc.area_from, 'to', uc.area_to),
              'bathrooms', jsonb_build_object('from', uc.bathrooms_from, 'to', uc.bathrooms_to),
              'starting_price', uc.starting_price,
              'total_units', uc.total_units,
              'layouts', uc.layouts
            )
            ORDER BY uc.area_from NULLS LAST
          ) FILTER (WHERE uc.unit_category_id IS NOT NULL),
          '[]'::jsonb
        ) AS unit_categories
      FROM project_base pb
      LEFT JOIN (
        SELECT
          uc.*,
          COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'layout_id', ul.layout_id,
                'layout_type', ul.layout_type,
                'bedrooms', ul.bedrooms,
                'bathrooms', ul.bathrooms,
                'area', ul.area,
                'floor_plans', COALESCE(
                  (SELECT jsonb_agg(
                    jsonb_build_object(
                      'floor_plan_id', ufp.floor_plan_id,
                      'image_url', ufp.image_url
                    )
                    ORDER BY ufp.floor_plan_id
                  )
                  FROM unit_floor_plans ufp
                  WHERE ufp.layout_id = ul.layout_id),
                  '[]'::jsonb
                )
              )
              ORDER BY ul.layout_id
            )
            FROM unit_layouts ul
            WHERE ul.unit_category_id = uc.unit_category_id),
            '[]'::jsonb
          ) AS layouts
        FROM unit_categories uc
      ) uc ON uc.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Payment plans with phases and milestones
    payment_plans_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'payment_plan', ppp.payment_plan,
              'phases', ppp.phases
            )
          ) FILTER (WHERE ppp.payment_plan IS NOT NULL),
          '[]'::jsonb
        ) AS payment_plans
      FROM project_base pb
      LEFT JOIN (
        SELECT
          ppp.project_id,
          ppp.payment_plan,
          COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'phase_id', ph.phase_id,
                'label', ph.phase_label,
                'percentage', ph.phase_percentage,
                'milestones', COALESCE(
                  (SELECT jsonb_agg(
                    jsonb_build_object(
                      'milestone_id', m.milestone_id,
                      'label', m.label,
                      'percentage', m.percentage,
                      'sort_order', m.sort_order
                    )
                    ORDER BY m.sort_order
                  )
                  FROM payment_plan_milestones m
                  WHERE m.phase_id = ph.phase_id),
                  '[]'::jsonb
                )
              )
              ORDER BY ph.phase_label
            )
            FROM payment_plan_phases ph
            WHERE ph.project_id = ppp.project_id 
              AND ph.payment_plan = ppp.payment_plan),
            '[]'::jsonb
          ) AS phases
        FROM project_payment_plans ppp
      ) ppp ON ppp.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Construction timeline
    construction_timeline_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'phase_key', pct.phase_key,
              'title', pct.title,
              'category', pct.category,
              'completed', pct.completed,
              'progress_percentage', pct.progress_percentage,
              'phase_date', pct.phase_date,
              'sort_order', pct.sort_order
            )
            ORDER BY pct.sort_order
          ) FILTER (WHERE pct.timeline_id IS NOT NULL),
          '[]'::jsonb
        ) AS construction_timeline
      FROM project_base pb
      LEFT JOIN project_construction_timeline pct ON pct.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Gallery images
    gallery_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'image_id', gi.image_id,
              'url', gi.source_url,
              'variant', gi.variant_medium,
              'sort_order', gi.sort_order
            )
            ORDER BY gi.sort_order
          ) FILTER (WHERE gi.image_id IS NOT NULL),
          '[]'::jsonb
        ) AS gallery
      FROM project_base pb
      LEFT JOIN project_gallery_images gi ON gi.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Media (images/videos)
    media_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'type', pm.media_type,
              'url', pm.source_url,
              'variant', pm.variant_medium
            )
          ) FILTER (WHERE pm.media_id IS NOT NULL),
          '[]'::jsonb
        ) AS media
      FROM project_base pb
      LEFT JOIN project_media pm ON pm.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Agencies
    agencies_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'agency_id', ag.agency_id,
              'name', ag.name,
              'logo_url', ag.logo_url,
              'qr_url', ag.qr_url,
              'role', pa.role
            )
          ) FILTER (WHERE ag.agency_id IS NOT NULL),
          '[]'::jsonb
        ) AS agencies
      FROM project_base pb
      LEFT JOIN project_agency pa ON pa.project_id = pb.project_id
      LEFT JOIN agency ag ON ag.agency_id = pa.agency_id
      GROUP BY pb.project_id
    ),

    -- Similar projects
    similar_projects_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'project_id', sp.similar_project_id,
              'sort_order', sp.sort_order,
              'weight_ranking', sp.weight_ranking
            )
            ORDER BY sp.weight_ranking DESC NULLS LAST
          ) FILTER (WHERE sp.similar_project_id IS NOT NULL),
          '[]'::jsonb
        ) AS similar_projects
      FROM project_base pb
      LEFT JOIN project_similar_projects sp ON sp.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Contacts
    contacts_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'contact_type', pc.contact_type,
              'contact_link', pc.contact_link
            )
            ORDER BY pc.contact_type
          ) FILTER (WHERE pc.contact_type IS NOT NULL),
          '[]'::jsonb
        ) AS contacts
      FROM project_base pb
      LEFT JOIN project_contacts pc ON pc.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- Sales history (explicitly from project_sales_history)
    project_sales_history_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'starting_price', ph.starting_price,
              'sales_phase', ph.sales_phase,
              'stock_availability', ph.stock_availability,
              'hotness_level', ph.hotness_level,
              'captured_at', ph.captured_at
            )
            ORDER BY ph.captured_at DESC
          ) FILTER (WHERE ph.id IS NOT NULL),
          '[]'::jsonb
        ) AS sales_history
      FROM project_base pb
      LEFT JOIN project_sales_history ph ON ph.project_id = pb.project_id
      GROUP BY pb.project_id
    ),

    -- FAQs
    faqs_agg AS (
      SELECT
        pb.project_id,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'question', pf.question,
              'answer_html', pf.answer_html
            )
            ORDER BY pf.question
          ) FILTER (WHERE pf.question IS NOT NULL),
          '[]'::jsonb
        ) AS faqs
      FROM project_base pb
      LEFT JOIN project_faqs pf ON pf.project_id = pb.project_id
      GROUP BY pb.project_id
    )

    -- Final assembly (use LATERAL for single-row picks: developer, location, latest snapshot, master_plan)
    SELECT
      pb.project_id,
      pb.project_name,
      pb.project_url,
      pb.source,
      pb.source_project_id,
      pb.latitude,
      pb.longitude,
      pb.raw_location_name,
      pb.description,
      pb.description_scraped_at,

      -- developer and location selected via LATERAL guarantees single-row JSON or NULL
      di.developer,
      li.location,

      -- latest snapshot status via LATERAL
      ps.status,

      paa.amenities,
      pia.images,
      pta.property_types,
      bca.bedroom_counts,
      uca.unit_categories,
      ppa.payment_plans,
      cta.construction_timeline,
      ga.gallery,
      ma.media,
      aa.agencies,
      spa.similar_projects,
      ca.contacts,
      phagg.sales_history,
      fa.faqs,
      mpi.master_plan

    FROM project_base pb

    -- developer (single JSON object or null)
    LEFT JOIN LATERAL (
      SELECT jsonb_build_object(
        'developer_id', d.developer_id,
        'name', d.name,
        'logo_url', d.logo_url
      ) AS developer
      FROM developers d
      WHERE d.developer_id = pb.developer_id
      LIMIT 1
    ) di ON TRUE

    -- location (single JSON object or null)
    LEFT JOIN LATERAL (
      SELECT jsonb_build_object(
        'location_id', l.location_id,
        'name', l.name,
        'slug', l.slug,
        'level', l.level,
        'parent_location_id', l.parent_location_id
      ) AS location
      FROM locations l
      WHERE l.location_id = pb.location_id
      LIMIT 1
    ) li ON TRUE

    -- latest project_sales_snapshot (single latest snapshot per project)
    LEFT JOIN LATERAL (
      SELECT jsonb_build_object(
        'construction_phase', COALESCE(ps.construction_phase, pb.construction_phase),
        'sales_phase', COALESCE(ps.sales_phase, pb.sales_phase),
        'stock_availability', COALESCE(ps.stock_availability, pb.stock_availability),
        'starting_price', COALESCE(ps.starting_price, pb.starting_price),
        'down_payment_percentage', COALESCE(ps.down_payment_percentage, pb.down_payment_percentage),
        'hotness_level', COALESCE(ps.hotness_level, pb.hotness_level),
        'delivery_date', COALESCE(ps.delivery_date, pb.delivery_date),
        'construction_progress', ps.construction_progress,
        'last_inspection_date', ps.last_inspection_date,
        'updated_at', ps.updated_at
      ) AS status
      FROM project_sales_snapshot ps
      WHERE ps.project_id = pb.project_id
      ORDER BY ps.updated_at DESC NULLS LAST
      LIMIT 1
    ) ps ON TRUE

    -- optional: latest project_master_plan row (converted to JSONB)
    LEFT JOIN LATERAL (
      SELECT COALESCE(to_jsonb(pmp), '{}'::jsonb) AS master_plan
      FROM project_master_plan pmp
      WHERE pmp.project_id = pb.project_id
      LIMIT 1
    ) mpi ON TRUE

    LEFT JOIN project_amenities_agg paa ON paa.project_id = pb.project_id
    LEFT JOIN project_images_agg pia ON pia.project_id = pb.project_id
    LEFT JOIN property_types_agg pta ON pta.project_id = pb.project_id
    LEFT JOIN bedroom_counts_agg bca ON bca.project_id = pb.project_id
    LEFT JOIN unit_categories_agg uca ON uca.project_id = pb.project_id
    LEFT JOIN payment_plans_agg ppa ON ppa.project_id = pb.project_id
    LEFT JOIN construction_timeline_agg cta ON cta.project_id = pb.project_id
    LEFT JOIN gallery_agg ga ON ga.project_id = pb.project_id
    LEFT JOIN media_agg ma ON ma.project_id = pb.project_id
    LEFT JOIN agencies_agg aa ON aa.project_id = pb.project_id
    LEFT JOIN similar_projects_agg spa ON spa.project_id = pb.project_id
    LEFT JOIN contacts_agg ca ON ca.project_id = pb.project_id
    LEFT JOIN project_sales_history_agg phagg ON phagg.project_id = pb.project_id
    LEFT JOIN faqs_agg fa ON fa.project_id = pb.project_id

    LIMIT 1;
  `);

  return result[0] ?? null;
}
