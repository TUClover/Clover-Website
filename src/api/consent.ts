import { toCamelCase } from "@/lib/utils";
import { CONSENT_ENDPOINT } from "./endpoints";

interface ResearchInfo {
  studyTitle: string;
  principalInvestigator: string;
  institution: string;
  irbProtocol: string;
}

interface Style {
  background?: string;
  leftColor?: string;
  rightColor?: string;
  fontWeight?: string;
  border?: string;
}

interface Block {
  id: string;
  type: string;
  content: any; // Can be string, string[], or complex objects
  style?: Style;
  order: number;
}

interface ConsentForm {
  id: number;
  title: string;
  subtitle: string;
  researchInfo: ResearchInfo;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

interface ConsentFormResponse {
  success: boolean;
  data: ConsentForm;
}

export async function getConsentForm(): Promise<{
  consentForm?: ConsentForm;
  error?: string;
}> {
  try {
    const response = await fetch(CONSENT_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const rawData: ConsentFormResponse | { error: string } =
      await response.json();

    if (!response.ok) {
      return {
        error:
          (rawData as { error: string }).error ||
          "Failed to fetch consent form",
      };
    }

    // Convert to camelCase before returning
    const camelCaseData = toCamelCase((rawData as ConsentFormResponse).data);
    return { consentForm: camelCaseData };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}
