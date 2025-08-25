from database.pgsql import init_db_connection
from datetime import datetime


def get_all_areas(offset=0, limit=20, search: str = None):
    db_init = init_db_connection()
    areas = []

    if db_init:
        cursor = db_init.cursor()
        try:
            query = """
                WITH sale_villa AS (
                    SELECT 
                        area_id,
                        area_name_en,
                        AVG(NULLIF(meter_sale_price, '')::numeric) AS villa_current_sale_price
                    FROM transactions.villa
                    WHERE EXTRACT(YEAR FROM instance_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
                    GROUP BY area_id, area_name_en
                ),
                sale_appt AS (
                    SELECT 
                        area_id,
                        area_name_en,
                        AVG(NULLIF(meter_sale_price, '')::numeric) AS apt_current_sale_price
                    FROM transactions.appartements
                    WHERE EXTRACT(YEAR FROM instance_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
                    GROUP BY area_id, area_name_en
                ),
                rent_villa AS (
                    SELECT 
                        area_id,
                        area_name_en,
                        AVG((annual_amount::numeric) / NULLIF(actual_area, 0)) AS villa_current_rent_price
                    FROM transactions.rents_villa
                    WHERE actual_area > 0
                      AND EXTRACT(YEAR FROM contract_start_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
                    GROUP BY area_id, area_name_en
                ),
                rent_appt AS (
                    SELECT 
                        area_id,
                        area_name_en,
                        AVG((annual_amount::numeric) / NULLIF(actual_area, 0)) AS apt_current_rent_price
                    FROM transactions.rents_apartements
                    WHERE actual_area > 0
                      AND EXTRACT(YEAR FROM contract_start_date)::int = EXTRACT(YEAR FROM CURRENT_DATE)::int
                    GROUP BY area_id, area_name_en
                )
                SELECT 
                    COALESCE(sv.area_id, sa.area_id, rv.area_id, ra.area_id) AS area_id,
                    COALESCE(sv.area_name_en, sa.area_name_en, rv.area_name_en, ra.area_name_en) AS area_name,
                    sv.villa_current_sale_price,
                    rv.villa_current_rent_price,
                    sa.apt_current_sale_price,
                    ra.apt_current_rent_price
                FROM sale_villa sv
                FULL OUTER JOIN sale_appt sa ON sv.area_id = sa.area_id
                FULL OUTER JOIN rent_villa rv ON COALESCE(sv.area_id, sa.area_id) = rv.area_id
                FULL OUTER JOIN rent_appt ra ON COALESCE(sv.area_id, sa.area_id, rv.area_id) = ra.area_id
            """

            # add search filter dynamically
            if search:
                query += " WHERE COALESCE(sv.area_name_en, sa.area_name_en, rv.area_name_en, ra.area_name_en) ILIKE %s "

            query += " ORDER BY area_name OFFSET %s LIMIT %s; "

            if search:
                search_pattern = f"%{search}%"
                cursor.execute(query, (search_pattern, offset, limit))
            else:
                cursor.execute(query, (offset, limit))

            rows = cursor.fetchall()
            for row in rows:
                area_data = {
                    "area_id": row[0],
                    "area_name": row[1],
                    "villa_current_sale_price": float(row[2]) if row[2] else None,
                    "villa_current_rent_price": float(row[3]) if row[3] else None,
                    "apt_current_sale_price": float(row[4]) if row[4] else None,
                    "apt_current_rent_price": float(row[5]) if row[5] else None,
                }
                areas.append(area_data)

        except Exception as e:
            print("Error fetching current avg prices:", e)
        finally:
            cursor.close()
            db_init.close()

    return areas


from database.pgsql import init_db_connection
from datetime import datetime


def get_areas_rental_yield(offset=0, limit=5, search: str = None):
    db_init = init_db_connection()
    areas = []
    current_year = datetime.now().year
    last_year = current_year - 1

    if db_init:
        cursor = db_init.cursor()
        try:
            # Add WHERE filter only if search is provided
            search_filter = ""
            params = [current_year, last_year, current_year, last_year, offset, limit]

            if search:
                search_filter = "WHERE COALESCE(vcy.area_name_en, vly.area_name_en, acy.area_name_en, aly.area_name_en) ILIKE %s"
                params.insert(-2, f"%{search}%")  # insert before offset & limit

            query = f"""
                WITH sale_villa AS (
                    SELECT
                        area_id,
                        area_name_en,
                        EXTRACT(YEAR FROM instance_date)::int AS year,
                        AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price_sqft
                    FROM transactions.villa
                    WHERE trans_group_en = 'Sales'
                    GROUP BY area_id, area_name_en, year
                ),
                sale_appt AS (
                    SELECT
                        area_id,
                        area_name_en,
                        EXTRACT(YEAR FROM instance_date)::int AS year,
                        AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price_sqft
                    FROM transactions.appartements
                    WHERE trans_group_en = 'Sales'
                    GROUP BY area_id, area_name_en, year
                ),
                rent_villa AS (
                    SELECT
                        area_id,
                        area_name_en,
                        EXTRACT(YEAR FROM contract_start_date)::int AS year,
                        AVG((annual_amount::numeric) / NULLIF(actual_area, 0)) AS avg_rent_price_sqft
                    FROM transactions.rents_villa
                    WHERE actual_area > 0
                    GROUP BY area_id, area_name_en, year
                ),
                rent_appt AS (
                    SELECT
                        area_id,
                        area_name_en,
                        EXTRACT(YEAR FROM contract_start_date)::int AS year,
                        AVG((annual_amount::numeric) / NULLIF(actual_area, 0)) AS avg_rent_price_sqft
                    FROM transactions.rents_apartements
                    WHERE actual_area > 0
                    GROUP BY area_id, area_name_en, year
                ),
                villa AS (
                    SELECT
                        sv.area_id,
                        sv.area_name_en,
                        sv.year,
                        sv.avg_sale_price_sqft,
                        rv.avg_rent_price_sqft,
                        CASE 
                            WHEN sv.avg_sale_price_sqft IS NULL OR sv.avg_sale_price_sqft = 0 THEN NULL
                            ELSE ROUND((rv.avg_rent_price_sqft * 100) / sv.avg_sale_price_sqft, 2)
                        END AS rental_yield_pct
                    FROM sale_villa sv
                    LEFT JOIN rent_villa rv 
                        ON sv.area_id = rv.area_id AND sv.year = rv.year
                ),
                appt AS (
                    SELECT
                        sa.area_id,
                        sa.area_name_en,
                        sa.year,
                        sa.avg_sale_price_sqft,
                        ra.avg_rent_price_sqft,
                        CASE 
                            WHEN sa.avg_sale_price_sqft IS NULL OR sa.avg_sale_price_sqft = 0 THEN NULL
                            ELSE ROUND((ra.avg_rent_price_sqft * 100) / sa.avg_sale_price_sqft, 2)
                        END AS rental_yield_pct
                    FROM sale_appt sa
                    LEFT JOIN rent_appt ra 
                        ON sa.area_id = ra.area_id AND sa.year = ra.year
                )
                SELECT 
                    COALESCE(vcy.area_id, vly.area_id, acy.area_id, aly.area_id) AS area_id,
                    COALESCE(vcy.area_name_en, vly.area_name_en, acy.area_name_en, aly.area_name_en) AS area_name,

                    vcy.rental_yield_pct AS villa_yield_current_year,
                    vly.rental_yield_pct AS villa_yield_last_year,
                    CASE 
                        WHEN vly.rental_yield_pct IS NULL OR vly.rental_yield_pct = 0 THEN NULL
                        ELSE ROUND(((vcy.rental_yield_pct - vly.rental_yield_pct) * 100) / vly.rental_yield_pct, 2)
                    END AS villa_yield_growth_pct,

                    acy.rental_yield_pct AS apt_yield_current_year,
                    aly.rental_yield_pct AS apt_yield_last_year,
                    CASE 
                        WHEN aly.rental_yield_pct IS NULL OR aly.rental_yield_pct = 0 THEN NULL
                        ELSE ROUND(((acy.rental_yield_pct - aly.rental_yield_pct) * 100) / aly.rental_yield_pct, 2)
                    END AS apt_yield_growth_pct

                FROM (SELECT * FROM villa WHERE year = %s) vcy
                FULL OUTER JOIN (SELECT * FROM villa WHERE year = %s) vly
                    ON vcy.area_id = vly.area_id
                FULL OUTER JOIN (SELECT * FROM appt WHERE year = %s) acy
                    ON COALESCE(vcy.area_id, vly.area_id) = acy.area_id
                FULL OUTER JOIN (SELECT * FROM appt WHERE year = %s) aly
                    ON COALESCE(vcy.area_id, vly.area_id, acy.area_id) = aly.area_id
                {search_filter}
                ORDER BY area_name
                OFFSET %s LIMIT %s;
            """

            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()

            for row in rows:
                areas.append(
                    {
                        "area_id": row[0],
                        "area_name": row[1],
                        "villa_yield_current_year": row[2],
                        "villa_yield_last_year": row[3],
                        "villa_yield_growth_pct": row[4],
                        "apt_yield_current_year": row[5],
                        "apt_yield_last_year": row[6],
                        "apt_yield_growth_pct": row[7],
                    }
                )

        except Exception as e:
            print("Error:", e)
        finally:
            cursor.close()
            db_init.close()

    return areas


def get_vacancy_risk_price_growth(offset=0, limit=20, search=None):
    db_init = init_db_connection()
    areas = []
    current_year = datetime.now().year

    if db_init:
        cursor = db_init.cursor()
        try:
            # Prepare search filter
            search_filter = ""
            params = [
                current_year,
                current_year,
                current_year,
                current_year,
                offset,
                limit,
            ]

            if search:
                search_filter = (
                    "WHERE COALESCE(v_curr.area_name_en, a_curr.area_name_en) ILIKE %s"
                )
                params.insert(-2, f"%{search}%")  # Insert before offset & limit

            query = f"""
                WITH 
                villa_sales AS (
                    SELECT 
                        area_id,
                        area_name_en,
                        EXTRACT(YEAR FROM instance_date)::int AS yr,
                        AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price
                    FROM transactions.villa
                    WHERE trans_group_en = 'Sales'
                    GROUP BY area_id, area_name_en, yr
                ),
                appt_sales AS (
                    SELECT 
                        area_id,
                        area_name_en,
                        EXTRACT(YEAR FROM instance_date)::int AS yr,
                        AVG(NULLIF(meter_sale_price, '')::numeric) AS avg_sale_price
                    FROM transactions.appartements
                    WHERE trans_group_en = 'Sales'
                    GROUP BY area_id, area_name_en, yr
                ),
                villa_rent_count AS (
                    SELECT 
                        area_id,
                        COUNT(*) AS num_rentals
                    FROM transactions.rents_villa
                    WHERE actual_area > 0
                    GROUP BY area_id
                ),
                villa_sales_count AS (
                    SELECT 
                        area_id,
                        COUNT(*) AS num_sales
                    FROM transactions.villa
                    WHERE trans_group_en = 'Sales'
                    GROUP BY area_id
                ),
                appt_rent_count AS (
                    SELECT 
                        area_id,
                        COUNT(*) AS num_rentals
                    FROM transactions.rents_apartements
                    WHERE actual_area > 0
                    GROUP BY area_id
                ),
                appt_sales_count AS (
                    SELECT 
                        area_id,
                        COUNT(*) AS num_sales
                    FROM transactions.appartements
                    WHERE trans_group_en = 'Sales'
                    GROUP BY area_id
                )

                SELECT
                    COALESCE(v_curr.area_id, a_curr.area_id) AS area_id,
                    COALESCE(v_curr.area_name_en, a_curr.area_name_en) AS area_name,

                    ROUND(
                        CASE 
                            WHEN v_last.avg_sale_price IS NULL OR v_last.avg_sale_price = 0 THEN NULL
                            ELSE ((v_curr.avg_sale_price - v_last.avg_sale_price) / v_last.avg_sale_price) * 100
                        END
                    ,2) AS villa_price_growth_pct,

                    ROUND(
                        CASE 
                            WHEN a_last.avg_sale_price IS NULL OR a_last.avg_sale_price = 0 THEN NULL
                            ELSE ((a_curr.avg_sale_price - a_last.avg_sale_price) / a_last.avg_sale_price) * 100
                        END
                    ,2) AS apt_price_growth_pct,

                    ROUND(
                    CASE 
                        WHEN v_sales.num_sales IS NULL OR (v_sales.num_sales + COALESCE(v_rent.num_rentals,0)) = 0 
                        THEN NULL
                        ELSE v_sales.num_sales::numeric / (v_sales.num_sales + COALESCE(v_rent.num_rentals,0))
                    END
                    ,2) AS villa_vacancy_risk,

                    ROUND(
                    CASE 
                        WHEN a_sales.num_sales IS NULL OR (a_sales.num_sales + COALESCE(a_rent.num_rentals,0)) = 0 
                        THEN NULL
                        ELSE a_sales.num_sales::numeric / (a_sales.num_sales + COALESCE(a_rent.num_rentals,0))
                    END
                    ,2) AS apt_vacancy_risk

                FROM 
                    (SELECT * FROM villa_sales WHERE yr = %s) v_curr
                FULL OUTER JOIN 
                    (SELECT * FROM villa_sales WHERE yr = %s - 1) v_last
                    ON v_curr.area_id = v_last.area_id
                LEFT JOIN villa_rent_count v_rent
                    ON COALESCE(v_curr.area_id, v_last.area_id) = v_rent.area_id
                LEFT JOIN villa_sales_count v_sales
                    ON COALESCE(v_curr.area_id, v_last.area_id) = v_sales.area_id

                FULL OUTER JOIN 
                    (SELECT * FROM appt_sales WHERE yr = %s) a_curr
                    ON COALESCE(v_curr.area_id, v_last.area_id) = a_curr.area_id
                FULL OUTER JOIN
                    (SELECT * FROM appt_sales WHERE yr = %s - 1) a_last
                    ON a_curr.area_id = a_last.area_id
                LEFT JOIN appt_rent_count a_rent
                    ON COALESCE(a_curr.area_id, a_last.area_id) = a_rent.area_id
                LEFT JOIN appt_sales_count a_sales
                    ON COALESCE(a_curr.area_id, a_last.area_id) = a_sales.area_id

                {search_filter}
                OFFSET %s LIMIT %s;
            """

            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()

            for row in rows:
                areas.append(
                    {
                        "area_id": row[0],
                        "area_name": row[1],
                        "villa_price_growth_pct": row[2],
                        "apt_price_growth_pct": row[3],
                        "villa_vacancy_risk": row[4],
                        "apt_vacancy_risk": row[5],
                    }
                )

        except Exception as e:
            print("Error:", e)
        finally:
            cursor.close()
            db_init.close()

    return areas





def get_transactions_total_value(offset=0, limit=20, search=None):
    areas = []
    current_year = datetime.now().year

    db_init = init_db_connection()
    if db_init:
        cursor = db_init.cursor()
        try:
            # Prepare search filter
            search_filter = ""
            params = [current_year, current_year, current_year, current_year]

            if search:
                search_filter = "WHERE COALESCE(v.area_name, a.area_name) ILIKE %s"
                params.append(f"%{search}%")

            # Add offset & limit
            params.extend([offset, limit])

            query = f"""
            WITH villa_tx AS (
                SELECT
                    area_id,
                    area_name_en AS area_name,
                    COUNT(*) AS villa_tx_all,
                    SUM(NULLIF(meter_sale_price, '')::NUMERIC) AS villa_value_all,
                    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = %s) AS villa_tx_last_year,
                    SUM(NULLIF(meter_sale_price, '')::NUMERIC) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = %s) AS villa_value_last_year
                FROM transactions.villa
                WHERE trans_group_en = 'Sales'
                GROUP BY area_id, area_name_en
            ),
            appt_tx AS (
                SELECT
                    area_id,
                    area_name_en AS area_name,
                    COUNT(*) AS apt_tx_all,
                    SUM(NULLIF(meter_sale_price, '')::NUMERIC) AS apt_value_all,
                    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = %s) AS apt_tx_last_year,
                    SUM(NULLIF(meter_sale_price, '')::NUMERIC) FILTER (WHERE EXTRACT(YEAR FROM instance_date) = %s) AS apt_value_last_year
                FROM transactions.appartements
                WHERE trans_group_en = 'Sales'
                GROUP BY area_id, area_name_en
            )
            SELECT
                COALESCE(v.area_id, a.area_id) AS area_id,
                COALESCE(v.area_name, a.area_name) AS area_name,
                v.villa_tx_all,
                v.villa_value_all,
                v.villa_tx_last_year,
                v.villa_value_last_year,
                a.apt_tx_all,
                a.apt_value_all,
                a.apt_tx_last_year,
                a.apt_value_last_year
            FROM villa_tx v
            FULL OUTER JOIN appt_tx a
                ON v.area_id = a.area_id
            {search_filter}
            ORDER BY area_name
            OFFSET %s LIMIT %s;
            """

            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()

            for row in rows:
                areas.append(
                    {
                        "area_id": row[0],
                        "area_name": row[1],
                        "villa_tx_all": row[2],
                        "villa_value_all": (
                            float(row[3]) if row[3] is not None else None
                        ),
                        "villa_tx_last_year": row[4],
                        "villa_value_last_year": (
                            float(row[5]) if row[5] is not None else None
                        ),
                        "apt_tx_all": row[6],
                        "apt_value_all": float(row[7]) if row[7] is not None else None,
                        "apt_tx_last_year": row[8],
                        "apt_value_last_year": (
                            float(row[9]) if row[9] is not None else None
                        ),
                    }
                )

        except Exception as e:
            print("Error fetching transactions:", e)
        finally:
            cursor.close()
            db_init.close()

    return areas
