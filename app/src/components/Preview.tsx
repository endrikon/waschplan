import parse from "html-react-parser";
import "../assets/custom.css";
import "../assets/custom.scss";
import { invoke } from "@tauri-apps/api/core";

const printCurrentPage = async () => {
  try {
    await invoke("print_window");
  } catch (error) {
    console.error("Print error:", error);
  }
};

const removeHtmlTag = (htmlString: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc.body.innerHTML; // Gets everything inside <body>
};

interface PreviewParameters {
  returnToCreation: () => void;
  preview: string;
}

function Preview({ returnToCreation, preview }: PreviewParameters) {
  const TablePreview = () => {
    const cleanedHtml = removeHtmlTag(preview);
    return parse(cleanedHtml);
  };

  return (
    <>
      <div className="bootstrap-scope bootstrap-scope no-page-break">
        <TablePreview />
      </div>
      <div className="pt-5 noprint"></div>
      <div
        className="noprint"
        style={{ position: "fixed", bottom: 0, width: "100%" }}
      >
        <div className="columns noprint">
          <div className="column is-half noprint">
            <button
              className="button is-fullwidth is-link noprint"
              onClick={returnToCreation}
            >
              Zurück
            </button>
          </div>
          <div className="column is-half noprint">
            <button
              className="button is-fullwidth is-link noprint"
              onClick={printCurrentPage}
            >
              Drucken
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Preview;
