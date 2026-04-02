const DOCX_URL =
  "https://filedn.com/lvSV5gd3xgHzmshlytr2p5J/overdeauteur-trainingsoverzicht.docx";

export default async function handler(req) {
  try {
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(DOCX_URL + cacheBuster, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch auteur document: ${response.status} ${response.statusText}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching auteur docx:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch the auteur document" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
