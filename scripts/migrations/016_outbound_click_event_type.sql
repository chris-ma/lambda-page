alter table events drop constraint events_type_check;
alter table events add constraint events_type_check check (
  type = any (array['click', 'rage_click', 'scroll_depth', 'funnel_stage', 'form_focus', 'form_blur', 'form_change', 'form_error', 'vital', 'pageview', 'outbound_click'])
);
