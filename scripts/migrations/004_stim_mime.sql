-- Wireframe uploads can be PNG or JPEG (unlike the PNG-only Playwright
-- screenshots the stimulus column originally held), so the serving route
-- needs to know which.
alter table analysis_runs add column if not exists stim_mime text not null default 'image/png';
