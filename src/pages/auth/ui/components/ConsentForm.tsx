import { getConsentForm } from "@/api/consent";
import ModalContainer from "@/components/ModalContainer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsentChange: (consented: boolean) => void;
  onConsentViewed: () => void;
  initialConsent: boolean;
}

interface Block {
  id: string;
  type: string;
  content: any;
  style?: any;
  order: number;
}

// Helper function to get background classes based on style
const getBackgroundClass = (background: string) => {
  const backgroundMap: { [key: string]: string } = {
    gray: "bg-gray-50 dark:bg-gray-900",
    blue: "bg-blue-50 dark:bg-blue-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20",
  };
  return backgroundMap[background] || "";
};

// Helper function to get text classes based on background
const getTextClass = (background: string) => {
  const textMap: { [key: string]: string } = {
    gray: "text-gray-900 dark:text-gray-100",
    blue: "text-blue-900 dark:text-blue-100",
    red: "text-red-900 dark:text-red-100",
    green: "text-green-900 dark:text-green-100",
    yellow: "text-yellow-900 dark:text-yellow-100",
  };
  return textMap[background] || "text-gray-900 dark:text-gray-100";
};

// Component to render individual blocks
const BlockRenderer = ({ block }: { block: Block }) => {
  const { type, content, style } = block;

  switch (type) {
    case "section_header":
      return (
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
          {content}
        </h3>
      );

    case "paragraph":
      const fontWeight =
        style?.fontWeight === "semibold" ? "font-semibold" : "";
      return <p className={fontWeight}>{content}</p>;

    case "list":
      const listBg = style?.background
        ? getBackgroundClass(style.background)
        : "";
      return (
        <div className={`p-4 rounded-lg ${listBg}`}>
          <ul className="list-disc pl-6 space-y-1">
            {content.map((item: string, index: number) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>
      );

    case "info_box":
      const infoBg = style?.background
        ? getBackgroundClass(style.background)
        : "";
      const infoText = style?.background ? getTextClass(style.background) : "";
      const infoWeight =
        style?.fontWeight === "semibold" ? "font-semibold" : "font-medium";
      return (
        <div className={`p-4 rounded-lg mb-3 ${infoBg}`}>
          <p className={`${infoText} ${infoWeight}`}>{content}</p>
        </div>
      );

    case "info_box_list":
      const boxListBg = style?.background
        ? getBackgroundClass(style.background)
        : "";
      const borderClass =
        style?.border === "thick"
          ? "border-2 border-gray-300 dark:border-gray-600"
          : "";
      return (
        <div className={`p-4 rounded-lg ${boxListBg} ${borderClass}`}>
          <ul className="space-y-2">
            {content.map((item: string, index: number) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>
      );

    case "two_column_box":
      const leftBg = style?.leftColor
        ? getBackgroundClass(style.leftColor)
        : "";
      const rightBg = style?.rightColor
        ? getBackgroundClass(style.rightColor)
        : "";
      const leftText = style?.leftColor ? getTextClass(style.leftColor) : "";
      const rightText = style?.rightColor ? getTextClass(style.rightColor) : "";

      return (
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${leftBg}`}>
            <h4 className={`font-medium mb-2 ${leftText}`}>
              {content.left.title}
            </h4>
            <ul className="text-sm space-y-1">
              {content.left.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={`p-4 rounded-lg ${rightBg}`}>
            <h4 className={`font-medium mb-2 ${rightText}`}>
              {content.right.title}
            </h4>
            <ul className="text-sm space-y-1">
              {content.right.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "two_column_info":
      const twoBg = style?.background
        ? getBackgroundClass(style.background)
        : "";
      return (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className={`p-4 rounded-lg ${twoBg}`}>
            <h4 className="font-medium mb-2">{content.left.title}</h4>
            <div dangerouslySetInnerHTML={{ __html: content.left.content }} />
          </div>
          <div className={`p-4 rounded-lg ${twoBg}`}>
            <h4 className="font-medium mb-2">{content.right.title}</h4>
            <div dangerouslySetInnerHTML={{ __html: content.right.content }} />
          </div>
        </div>
      );

    default:
      return <div>Unknown block type: {type}</div>;
  }
};

const ConsentForm = ({
  isOpen,
  onClose,
  onConsentChange,
  onConsentViewed,
  initialConsent,
}: ConsentModalProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [localConsent, setLocalConsent] = useState(initialConsent);
  const [consentFormData, setConsentFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConsentForm = async () => {
      if (!isOpen) return;

      setLoading(true);
      setFetchError(null);

      try {
        const { consentForm, error } = await getConsentForm();

        if (error) {
          setFetchError(error);
          console.error("Error fetching consent form:", error);
        } else if (consentForm) {
          setConsentFormData(consentForm);
          console.log("Consent Form:", JSON.stringify(consentForm, null, 2));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setFetchError(errorMessage);
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsentForm();
  }, [isOpen]);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setLocalConsent(initialConsent);
    }
  }, [isOpen, initialConsent]);

  // Show loading state
  if (loading) {
    return (
      <ModalContainer isOpen={isOpen} onClose={onClose}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading consent form...</p>
          </div>
        </div>
      </ModalContainer>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <ModalContainer isOpen={isOpen} onClose={onClose}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center text-red-600">
            <p className="mb-4">Failed to load consent form</p>
            <p className="text-sm text-gray-600">{fetchError}</p>
          </div>
        </div>
      </ModalContainer>
    );
  }

  // Show message if no consent form data
  if (!consentFormData) {
    return (
      <ModalContainer isOpen={isOpen} onClose={onClose}>
        <div className="flex items-center justify-center p-8">
          <p>No consent form available</p>
        </div>
      </ModalContainer>
    );
  }

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConsentToggle = (checked: boolean) => {
    if (!hasScrolledToBottom) return;
    setLocalConsent(checked);
  };

  const handleConfirm = () => {
    onConsentViewed();
    onConsentChange(localConsent);
    onClose();
  };

  // Sort blocks by order
  const sortedBlocks = [...consentFormData.blocks].sort(
    (a, b) => a.order - b.order
  );

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <Card className="max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl py-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-row justify-between items-start space-y-0 pb-6">
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              {consentFormData.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {consentFormData.subtitle}
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-4"
          >
            <X size={20} />
          </button>
        </CardHeader>

        {/* Scrollable Content */}
        <CardContent
          className="flex-1 overflow-y-auto p-0"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <div className="h-full overflow-y-auto p-6 space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            <div className="space-y-6">
              {/* Research Information Header */}
              {consentFormData.researchInfo && (
                <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    STUDY TITLE:{" "}
                    {consentFormData.researchInfo.studyTitle ||
                      "Understanding Programming Learning Through AI-Assisted Education"}
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-xs mt-1">
                    Principal Investigator:{" "}
                    {consentFormData.researchInfo.principalInvestigator ||
                      "Dr. [Name]"}{" "}
                    • Institution: {consentFormData.researchInfo.institution} •
                    IRB Protocol: {consentFormData.researchInfo.irbProtocol}
                  </p>
                </div>
              )}

              {/* Render blocks dynamically */}
              {sortedBlocks.map((block: Block) => (
                <section
                  key={block.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
                >
                  <BlockRenderer block={block} />
                </section>
              ))}
            </div>
          </div>
        </CardContent>

        {/* Footer with consent checkbox and buttons */}
        <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex-col space-y-4 p-6">
          {!hasScrolledToBottom && (
            <div className="w-full text-center text-sm text-amber-600 dark:text-amber-400">
              Please read through the entire consent form above to continue.
            </div>
          )}

          <div className="w-full flex items-start space-x-3">
            <Checkbox
              id="modal-consent"
              checked={localConsent}
              onCheckedChange={handleConsentToggle}
              disabled={!hasScrolledToBottom}
              className="mt-1"
            />
            <Label
              htmlFor="modal-consent"
              className={`text-sm leading-relaxed cursor-pointer ${
                hasScrolledToBottom
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              I have read and understood the consent form above. I consent to
              Clover using the data collected from my usage for research
              purposes only.
            </Label>
          </div>

          <div className="w-full flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!hasScrolledToBottom}
              className="px-6"
            >
              Confirm
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ModalContainer>
  );
};

export default ConsentForm;
