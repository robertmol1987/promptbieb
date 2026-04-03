export const config = { runtime: 'edge' };

const DOCX_URL =
  "https://filedn.com/lvSV5gd3xgHzmshlytr2p5J/promptbibliotheek002.docx";

export default async function handler(req) {
  try {
    const response = await fetch(`${DOCX_URL}?t=${Date.now()}`, {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch document: ${response.status}` }),
        { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Stream the response body directly instead of buffering
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch the document" }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}
