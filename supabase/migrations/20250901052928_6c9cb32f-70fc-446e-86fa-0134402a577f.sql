-- Check view options and remove security_barrier if it exists
SELECT 
    c.relname AS view_name,
    c.reloptions AS view_options
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relkind = 'v'
AND c.relname IN ('milk_tests_view', 'milk_tests_aggregated_view');

-- Remove security_barrier from view options
ALTER VIEW milk_tests_view SET (security_barrier = false);
ALTER VIEW milk_tests_aggregated_view SET (security_barrier = false);