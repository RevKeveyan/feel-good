ALTER TABLE public.client_documents DROP CONSTRAINT client_documents_kind_check;
ALTER TABLE public.client_documents ADD CONSTRAINT client_documents_kind_check CHECK (kind IN ('pathology', 'treatment_plan', 'personalised_pod'));
