function getImagePositionStyle(part) {
  const style = {};

  if (!part.isAnchored) {
    // Inline image — keep inline
    style.display = "inline-block";
    style.verticalAlign = "middle";
    return style;
  }

  const hasTextWrap =
    part.wrapType === "square" ||
    part.wrapType === "tight" ||
    part.wrapType === "through";

  if (hasTextWrap) {
    // Floating image — text wraps around it
    if (part.hAlign === "right") {
      style.float = "right";
      style.marginLeft = "16px";
      style.marginBottom = "12px";
    } else if (part.hAlign === "center") {
      style.display = "block";
      style.marginLeft = "auto";
      style.marginRight = "auto";
      style.marginBottom = "12px";
    } else {
      // left or default
      style.float = "left";
      style.marginRight = "16px";
      style.marginBottom = "12px";
    }
  } else if (part.wrapType === "topAndBottom") {
    // Image on its own line, text above and below
    style.display = "block";
    style.marginBottom = "12px";
    if (part.hAlign === "right") {
      style.marginLeft = "auto";
      style.marginRight = "0";
    } else if (part.hAlign === "center") {
      style.marginLeft = "auto";
      style.marginRight = "auto";
    }
  } else {
    // wrapNone or fallback — treat as block with alignment
    style.display = "block";
    style.marginBottom = "12px";
    if (part.hAlign === "right") {
      style.marginLeft = "auto";
      style.marginRight = "0";
    } else if (part.hAlign === "center") {
      style.marginLeft = "auto";
      style.marginRight = "auto";
    }
  }

  return style;
}

export function ImageBlock({ parts, images }) {
  return (
    <div className="my-5">
      {parts.map((part, i) => {
        if (part.type === "image" && part.imageName && images[part.imageName]) {
          const imgStyle = {};
          if (part.widthPx && part.heightPx) {
            imgStyle.maxWidth = "100%";
            imgStyle.width = `${part.widthPx}px`;
            imgStyle.height = "auto";
            imgStyle.aspectRatio = `${part.widthPx} / ${part.heightPx}`;
          } else {
            imgStyle.maxWidth = "100%";
            imgStyle.height = "auto";
          }

          const positionStyle = getImagePositionStyle(part);

          return (
            <img
              key={i}
              src={images[part.imageName]}
              alt=""
              style={{
                ...imgStyle,
                ...positionStyle,
                borderRadius: "6px",
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
