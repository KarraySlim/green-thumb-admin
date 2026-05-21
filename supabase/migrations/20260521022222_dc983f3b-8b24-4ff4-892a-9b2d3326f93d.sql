
-- Function: return stock when reservation status moves OUT of 'reserve' (back to nouvelle_demande/en_analyse) or is deleted
CREATE OR REPLACE FUNCTION public.return_stock_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  -- On UPDATE: only when leaving 'reserve' or 'confirme' towards a "non reserved" state
  IF TG_OP = 'UPDATE' THEN
    IF (OLD.status IN ('reserve','confirme')) AND (NEW.status IN ('nouvelle_demande','en_analyse')) THEN
      FOR r IN SELECT ri.stock_item_id, ri.quantity, si.name
               FROM public.reservation_items ri
               JOIN public.stock_items si ON si.id = ri.stock_item_id
               WHERE ri.reservation_id = NEW.id LOOP
        UPDATE public.stock_items SET quantity = quantity + r.quantity WHERE id = r.stock_item_id;
        INSERT INTO public.stock_movements (stock_item_id, movement_type, quantity, reason, reservation_id)
        VALUES (r.stock_item_id, 'adjustment', r.quantity, 'Annulation réservation — retour stock', NEW.id);
      END LOOP;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('reserve','confirme') THEN
      FOR r IN SELECT ri.stock_item_id, ri.quantity
               FROM public.reservation_items ri
               WHERE ri.reservation_id = OLD.id LOOP
        UPDATE public.stock_items SET quantity = quantity + r.quantity WHERE id = r.stock_item_id;
        INSERT INTO public.stock_movements (stock_item_id, movement_type, quantity, reason, reservation_id)
        VALUES (r.stock_item_id, 'adjustment', r.quantity, 'Suppression réservation — retour stock', OLD.id);
      END LOOP;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_return_stock_upd ON public.material_reservations;
CREATE TRIGGER trg_return_stock_upd
AFTER UPDATE ON public.material_reservations
FOR EACH ROW EXECUTE FUNCTION public.return_stock_on_cancel();

DROP TRIGGER IF EXISTS trg_return_stock_del ON public.material_reservations;
CREATE TRIGGER trg_return_stock_del
BEFORE DELETE ON public.material_reservations
FOR EACH ROW EXECUTE FUNCTION public.return_stock_on_cancel();

-- Sync existing trigger for reservation decrement (recreate to ensure it's there)
DROP TRIGGER IF EXISTS trg_handle_reservation_status ON public.material_reservations;
CREATE TRIGGER trg_handle_reservation_status
AFTER UPDATE OF status ON public.material_reservations
FOR EACH ROW EXECUTE FUNCTION public.handle_reservation_status();

-- Sync surface.is_connected when reservation moves to 'installe', false otherwise
CREATE OR REPLACE FUNCTION public.sync_surface_connection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.surface_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.status = 'installe' THEN
    UPDATE public.surfaces SET is_connected = true WHERE id = NEW.surface_id;
  ELSIF OLD.status = 'installe' AND NEW.status <> 'installe' THEN
    UPDATE public.surfaces SET is_connected = false WHERE id = NEW.surface_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_surface_connection ON public.material_reservations;
CREATE TRIGGER trg_sync_surface_connection
AFTER UPDATE OF status ON public.material_reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_surface_connection();
