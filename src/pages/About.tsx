import React from "react";
import { CLOVER, Paragraph, Title } from "../components/ui/text";

/**
 * About page component.
 * This component displays information about CLOVER and embeds the Docusaurus documentation site.
 * @returns {JSX.Element} The About page component.
 */
export const About: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center width-container">
      <section className="w-full flex flex-col items-center justify-center text-center px-6 pt-6 pb-12">
        <Title>
          About <CLOVER />
        </Title>
        <Paragraph>
          Clover is an AI-powered code assistant, similar to Copilot that helps
          new developers learn and improve their coding skills. Below, you can
          explore our documentation for more details.
        </Paragraph>

        {/* Embedded Docusaurus Site */}
        <div className="w-full max-w-5xl h-[1000px] border border-gray-700 bg-white rounded-lg shadow-lg">
          <iframe
            src="https://capstone-projects-2025-spring.github.io/project-copilot-clone-2/"
            className="w-full h-full rounded-lg"
            title="CLOVER documentation"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default About;
