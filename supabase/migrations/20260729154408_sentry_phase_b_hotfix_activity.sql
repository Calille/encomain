CREATE OR REPLACE FUNCTION bump_claim_activity_from_sweep()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE area_claims
  SET last_activity_at = NOW()
  WHERE lad_code = NEW.lad_code
    AND claimed_by = NEW.swept_by
    AND released_at IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_claim_activity_from_sweep
AFTER INSERT ON sweep_cells
FOR EACH ROW
EXECUTE FUNCTION bump_claim_activity_from_sweep();

CREATE OR REPLACE FUNCTION bump_claim_activity_from_audit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  audit_lat DOUBLE PRECISION;
  audit_lng DOUBLE PRECISION;
BEGIN
  SELECT latitude, longitude INTO audit_lat, audit_lng
  FROM sentry_discovered_businesses
  WHERE id = NEW.discovered_business_id;

  IF audit_lat IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE area_claims ac
  SET last_activity_at = NOW()
  FROM uk_local_authorities lad
  WHERE ac.claimed_by = NEW.audited_by
    AND ac.released_at IS NULL
    AND ac.lad_code = lad.code
    AND point_in_bbox(audit_lat, audit_lng, lad.bbox_min_lat, lad.bbox_min_lng, lad.bbox_max_lat, lad.bbox_max_lng);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bump_claim_activity_from_audit
AFTER INSERT ON sentry_audits
FOR EACH ROW
EXECUTE FUNCTION bump_claim_activity_from_audit();;
