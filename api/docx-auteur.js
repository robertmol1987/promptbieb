const DOCX_URL =
  "https://filedn.com/lvSV5gd3xgHzmshlytr2p5J/overdeauteur-trainingsoverzicht.docx";

export default async function handler(req, res) {
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(DOCX_URL + cacheBuster, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: `Failed to fetch auteur document: ${response.status} ${response.statusText}`,
      });
    }

    const buffer = await response.arrayBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error fetching auteur docx:", error);
    res.status(500).json({ error: "Failed to fetch the auteur document" });
  }
}
