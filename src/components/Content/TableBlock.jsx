import { RichText } from "./RichText";

export function TableBlock({ table, images }) {
  if (!table || !table.rows || table.rows.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "16px", overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #D1D5DB",
        }}
      >
        <tbody>
          {table.rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.cells.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  style={{
                    border: "1px solid #D1D5DB",
                    padding: "8px 12px",
                    verticalAlign: "top",
                  }}
                >
                  {cell.content.map((paragraph, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        marginBottom:
                          pIdx < cell.content.length - 1 ? "8px" : "0",
                      }}
                    >
                      <RichText parts={paragraph.parts} images={images} />
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
