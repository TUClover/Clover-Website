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

const ConsentForm = ({
  isOpen,
  onClose,
  onConsentChange,
  onConsentViewed,
  initialConsent,
}: ConsentModalProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [localConsent, setLocalConsent] = useState(initialConsent);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setLocalConsent(initialConsent);
    }
  }, [isOpen, initialConsent]);

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
    if (!hasScrolledToBottom) return; // Prevent checking if not scrolled
    setLocalConsent(checked);
  };

  const handleConfirm = () => {
    onConsentViewed();
    onConsentChange(localConsent);
    onClose();
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <Card className="max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl py-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-row justify-between items-start space-y-0 pb-6">
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              CONSENT FOR PARTICIPATION IN RESEARCH
            </CardTitle>
            <CardDescription className="mt-1">
              Clover: AI-Powered Programming Education Platform
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
              <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  STUDY TITLE: Understanding Programming Learning Through
                  AI-Assisted Education
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-xs mt-1">
                  Principal Investigator: Dr. [Name] • Institution: [University]
                  • IRB Protocol: #2024-CS-001
                </p>
              </div>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  1. PURPOSE AND BACKGROUND
                </h3>
                <p>
                  You are being asked to participate in a research study. The
                  purpose of this research is to understand how students learn
                  programming through AI-powered educational tools. This study
                  will help improve computer science education and develop more
                  effective learning platforms.
                </p>
              </section>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  2. PROCEDURES
                </h3>
                <p className="mb-3">
                  If you agree to participate, we will collect and analyze the
                  following data:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <ul className="list-disc pl-6 space-y-1">
                    <li>
                      Code snippets and programming exercises you complete
                    </li>
                    <li>
                      Your interactions with AI suggestions, hints, and feedback
                    </li>
                    <li>
                      Time spent on activities and problem-solving approaches
                    </li>
                    <li>
                      Error patterns, debugging strategies, and learning
                      progress
                    </li>
                    <li>Quiz responses and assessment results</li>
                    <li>
                      Usage patterns, session duration, and platform engagement
                      metrics
                    </li>
                  </ul>
                </div>
              </section>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  3. RISKS AND BENEFITS
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                      Potential Risks:
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        • Minimal risk of data breach (mitigated by encryption)
                      </li>
                      <li>
                        • Potential privacy concerns (addressed through
                        anonymization)
                      </li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Potential Benefits:
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>• Contribute to advancing CS education research</li>
                      <li>• Help improve AI tutoring systems</li>
                      <li>• Support development of better learning tools</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  4. CONFIDENTIALITY AND DATA PROTECTION
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-3">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Your privacy and confidentiality will be protected through
                    the following measures:
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Anonymization:</strong> All personal identifiers
                    will be removed or encrypted before data analysis
                  </li>
                  <li>
                    <strong>Secure Storage:</strong> Data will be stored on
                    encrypted servers with restricted access
                  </li>
                  <li>
                    <strong>Limited Access:</strong> Only authorized research
                    personnel will have access to anonymized datasets
                  </li>
                  <li>
                    <strong>Data Retention:</strong> Research data will be
                    retained for 7 years as required by federal regulations
                  </li>
                  <li>
                    <strong>Publication:</strong> Results will be published in
                    aggregate form with no individual identification possible
                  </li>
                </ul>
              </section>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  5. VOLUNTARY PARTICIPATION AND WITHDRAWAL
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li>
                      <strong>Voluntary:</strong> Your participation in this
                      research is entirely voluntary
                    </li>
                    <li>
                      <strong>No Penalty:</strong> You may decline to
                      participate or withdraw at any time without penalty
                    </li>
                    <li>
                      <strong>Academic Impact:</strong> Your decision will not
                      affect your grades, course standing, or access to Clover
                    </li>
                    <li>
                      <strong>Withdrawal Process:</strong> You can withdraw
                      consent through your account settings at any time
                    </li>
                    <li>
                      <strong>Data Deletion:</strong> Upon withdrawal, your data
                      will be removed from future analyses (subject to legal
                      requirements)
                    </li>
                  </ul>
                </div>
              </section>

              <section className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  6. CONTACT INFORMATION
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Research Team:</h4>
                    <p>
                      Dr. [Principal Investigator]
                      <br />
                      Email: research@clover.edu
                      <br />
                      Phone: (555) 123-4567
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">IRB Office:</h4>
                    <p>
                      [University] IRB
                      <br />
                      Email: irb@university.edu
                      <br />
                      Phone: (555) 987-6543
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  7. CONSENT STATEMENT
                </h3>
                <div className="border-2 border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p className="font-medium mb-2">
                    By checking the consent box below, you acknowledge that:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>You have read and understand this consent form</li>
                    <li>You have had the opportunity to ask questions</li>
                    <li>You understand that participation is voluntary</li>
                    <li>
                      You understand how your data will be used and protected
                    </li>
                    <li>You consent to participate in this research study</li>
                  </ul>
                </div>
              </section>
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
