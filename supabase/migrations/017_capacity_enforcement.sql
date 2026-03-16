-- =============================================================================
-- 017: Atomic capacity enforcement
-- Concurrency-safe RSVP create and approve with exact occupancy logic.
-- =============================================================================

-- Contribution per RSVP: yes/approved => 1+plus_one, maybe => 0.5+plus_one*0.5, else 0
CREATE OR REPLACE FUNCTION invy_rsvp_contribution(p_status TEXT, p_plus_one INT)
RETURNS NUMERIC AS $$
BEGIN
  IF p_status IN ('yes', 'approved') THEN
    RETURN 1 + COALESCE(p_plus_one, 0);
  ELSIF p_status = 'maybe' THEN
    RETURN 0.5 + COALESCE(p_plus_one, 0) * 0.5;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Exact occupancy from all RSVPs for an event (no rounding)
CREATE OR REPLACE FUNCTION invy_exact_occupancy(p_event_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(invy_rsvp_contribution(status, plus_one)), 0)
  FROM rsvps
  WHERE event_id = p_event_id;
$$ LANGUAGE sql STABLE;

-- Atomic create: lock event, check capacity, insert. Returns new RSVP or raises.
CREATE OR REPLACE FUNCTION create_rsvp_with_capacity_check(
  p_event_id UUID,
  p_name TEXT,
  p_contact_info TEXT,
  p_status TEXT,
  p_plus_one INT DEFAULT 0,
  p_custom_field_values JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacity INT;
  v_occupancy NUMERIC;
  v_contribution NUMERIC;
  v_new_rsvp rsvps%ROWTYPE;
BEGIN
  -- Lock event row (blocks concurrent creates/approves for this event)
  SELECT capacity_limit INTO v_capacity
  FROM events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found' USING ERRCODE = 'P0002';
  END IF;

  -- No capacity limit: insert directly
  IF v_capacity IS NULL OR v_capacity <= 0 THEN
    INSERT INTO rsvps (event_id, name, contact_info, status, plus_one, custom_field_values)
    VALUES (p_event_id, p_name, p_contact_info, p_status, COALESCE(p_plus_one, 0), p_custom_field_values)
    RETURNING * INTO v_new_rsvp;
    RETURN to_jsonb(v_new_rsvp);
  END IF;

  -- Compute current occupancy and new contribution
  v_occupancy := invy_exact_occupancy(p_event_id);
  v_contribution := invy_rsvp_contribution(p_status, p_plus_one);

  IF v_occupancy + v_contribution > v_capacity THEN
    RAISE EXCEPTION 'This event is fully booked. No spots remaining.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO rsvps (event_id, name, contact_info, status, plus_one, custom_field_values)
  VALUES (p_event_id, p_name, p_contact_info, p_status, COALESCE(p_plus_one, 0), p_custom_field_values)
  RETURNING * INTO v_new_rsvp;

  RETURN to_jsonb(v_new_rsvp);
END;
$$;

-- Atomic approve: verify admin, lock event, check capacity, update. Returns count or raises.
CREATE OR REPLACE FUNCTION approve_rsvps_with_capacity_check(
  p_admin_secret TEXT,
  p_event_id UUID,
  p_rsvp_ids UUID[],
  p_status TEXT  -- 'approved' or 'declined'
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacity INT;
  v_occupancy NUMERIC;
  v_additional NUMERIC := 0;
  v_count INT;
BEGIN
  -- Verify admin_secret and lock event
  SELECT capacity_limit INTO v_capacity
  FROM events
  WHERE id = p_event_id AND admin_secret = p_admin_secret
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid manage link' USING ERRCODE = 'P0003';
  END IF;

  -- Decline: no capacity check
  IF p_status = 'declined' THEN
    UPDATE rsvps
    SET status = 'declined'
    WHERE event_id = p_event_id AND id = ANY(p_rsvp_ids) AND status = 'pending';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
  END IF;

  -- Approve: capacity check required when limit is set
  IF v_capacity IS NOT NULL AND v_capacity > 0 THEN
    v_occupancy := invy_exact_occupancy(p_event_id);

    -- Additional contribution from pending RSVPs we're approving
    SELECT COALESCE(SUM(invy_rsvp_contribution('approved', plus_one)), 0) INTO v_additional
    FROM rsvps
    WHERE event_id = p_event_id AND id = ANY(p_rsvp_ids) AND status = 'pending';

    IF v_occupancy + v_additional > v_capacity THEN
      RAISE EXCEPTION 'Approving would exceed capacity limit.' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  UPDATE rsvps
  SET status = 'approved'
  WHERE event_id = p_event_id AND id = ANY(p_rsvp_ids) AND status = 'pending';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
