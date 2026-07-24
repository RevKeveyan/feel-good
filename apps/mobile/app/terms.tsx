import { termsOfService } from "@feelgood/shared";
import { LegalDocScreen } from "@/components/LegalDocScreen";

export default function TermsScreen() {
  return <LegalDocScreen doc={termsOfService} />;
}
