-- Backfill des anciens flux ICS codés en dur vers calendar_config.
-- Ne touche pas aux propriétés qui ont déjà une liste de flux.

update public.properties
set calendar_config = jsonb_build_object(
  'ics_feeds',
  jsonb_build_array(
    jsonb_build_object(
      'id', 'airbnb',
      'name', 'Airbnb',
      'url', 'https://www.airbnb.fr/calendar/ical/4166287.ics?t=6cd173d47dea4333beac73a1f53febb1',
      'enabled', true
    ),
    jsonb_build_object(
      'id', 'booking',
      'name', 'Booking',
      'url', 'https://ical.booking.com/v1/export?t=d5ee4b7f-f747-47b3-95dd-88c2f1c11c50',
      'enabled', true
    ),
    jsonb_build_object(
      'id', 'abritel',
      'name', 'Abritel',
      'url', 'https://www.abritel.fr/icalendar/6baba6ffb0ac46bea0649e96aaea3566.ics',
      'enabled', true
    )
  )
)
where calendar_config is null
  or not (calendar_config ? 'ics_feeds')
  or jsonb_array_length(coalesce(calendar_config->'ics_feeds', '[]'::jsonb)) = 0;
