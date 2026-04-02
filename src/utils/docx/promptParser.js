/**
 * Parses the raw text sections from the docx into structured prompt data.
 *
 * The preamble section (level 0, title "__preamble__") contains all content
 * before the first heading: rules, chatbot list, and introduction page.
 *
 * Then each H1 heading is a prompt with [SECTION], [CATEGORIES], [TAGS], [TAALMODEL], [PROMPT]
 */

export function parsePromptLibrary(sections, auteurSections, auteurImages) {
  if (!sections || sections.length === 0) return null;

  const result = {
    chatbots: [],
    introduction: null,
    overDeAuteur: null,
    training: null,
    authorLinks: [],
    hoofdcategorieën: [],
    sectionOrder: [],
    prompts: [],
    allCategories: new Set(),
    allChatbotModels: new Set(),
    auteurImages: auteurImages || {},
  };

  // Step 1: Find and parse the preamble section (level 0, title "__preamble__")
  // All rules, chatbots, and intro text are in this section
  const preamble = sections.find((s) => s.title === "__preamble__");

  if (preamble && preamble.content) {
    parsePreamble(preamble, result);
  }

  // Step 1b: Parse auteur document for Over de auteur, Ook van deze auteur, TrainingenMenu
  if (auteurSections && auteurSections.length > 0) {
    const auteurPreamble = auteurSections.find(
      (s) => s.title === "__preamble__",
    );
    if (auteurPreamble && auteurPreamble.content) {
      parseAuteurPreamble(auteurPreamble, result);
    }
  }

  // Step 2: Parse all H1 sections as prompts
  for (const section of sections) {
    if (section.title === "__preamble__") continue;
    if (section.level !== 1) continue;

    const prompt = parsePromptSection(section);
    if (prompt) {
      result.prompts.push(prompt);
      for (const cat of prompt.categories) {
        result.allCategories.add(cat);
      }
      if (prompt.taalmodel) {
        result.allChatbotModels.add(prompt.taalmodel);
      }
    }
  }

  // Convert categories to sorted array with "Alle prompts" first
  const sortedCategories = Array.from(result.allCategories).sort((a, b) =>
    a.localeCompare(b, "nl"),
  );
  result.allCategories = ["Alle prompts", ...sortedCategories];

  // Convert chatbot models to sorted array
  const sortedModels = Array.from(result.allChatbotModels).sort((a, b) =>
    a.localeCompare(b, "nl"),
  );
  result.allChatbotModels = sortedModels;

  return result;
}

/**
 * Parse the preamble section which contains all pre-heading content:
 * - [Rules] with section order and chatbot list
 * - [Introduction page] with welcome content
 */
function parsePreamble(preamble, result) {
  const items = preamble.content;

  let phase = "before-start";
  let savedPhase = null;
  const introContentItems = [];
  const overDeAuteurItems = [];
  const authorLinksItems = [];
  const trainingItems = [];
  const paginaTitelItems = [];
  const paginaSubtitelItems = [];
  const rulesLines = [];
  const chatbotLines = [];
  let inChatbots = false;

  for (const item of items) {
    const itemText = getItemText(item);

    if (itemText.includes("[Paginatitel]")) {
      savedPhase = phase;
      phase = "paginatitel";
      continue;
    }
    if (itemText.includes("[Einde Paginatitel]")) {
      phase = savedPhase || "before-start";
      savedPhase = null;
      continue;
    }
    if (itemText.includes("[Pagina subtitel]")) {
      savedPhase = phase;
      phase = "pagina-subtitel";
      continue;
    }
    if (
      itemText.includes("[Einde Pagina subtitel]") ||
      itemText.includes("[Einde pagina subtitel]")
    ) {
      phase = savedPhase || "before-start";
      savedPhase = null;
      continue;
    }

    if (itemText.includes("[Start loading here]")) {
      phase = "start";
      continue;
    }

    if (itemText.includes("[Rules]") || phase === "start") {
      phase = "rules";
      if (itemText.includes("[Rules]")) continue;
    }

    if (itemText.includes("[List of chatbots]")) {
      inChatbots = true;
      continue;
    }

    if (itemText.includes("[End of list of chatbots]")) {
      inChatbots = false;
      continue;
    }

    if (itemText.includes("[End of rules]")) {
      phase = "after-rules";
      inChatbots = false;
      continue;
    }

    if (itemText.includes("[Introduction page]")) {
      phase = "intro";
      continue;
    }

    if (
      itemText.includes("[End of introduction page]") ||
      itemText.includes("[End of  introduction  page]")
    ) {
      phase = "after-intro";
      continue;
    }

    if (itemText.includes("[Over de auteur]")) {
      phase = "auteur";
      continue;
    }

    if (itemText.includes("[Einde over de auteur]")) {
      phase = "after-auteur";
      continue;
    }

    // Sub-section within auteur for "Ook van deze auteur" links
    if (itemText.includes("[Ook van deze auteur]")) {
      phase = "auteur-links";
      continue;
    }

    if (itemText.includes("[Einde Ook van deze auteur]")) {
      phase = "auteur";
      continue;
    }

    if (itemText.includes("[TrainingenMenu]")) {
      phase = "training";
      continue;
    }

    if (itemText.includes("[Einde TrainingenMenu]")) {
      phase = "after-training";
      continue;
    }

    if (phase === "before-start") {
      // Still collect paginatitel/subtitel even before [Start loading here]
      continue;
    }

    if (phase === "paginatitel") {
      paginaTitelItems.push(item);
      continue;
    }
    if (phase === "pagina-subtitel") {
      paginaSubtitelItems.push(item);
      continue;
    }

    if (inChatbots) {
      chatbotLines.push(itemText);
    } else if (phase === "rules") {
      rulesLines.push(itemText);
    } else if (phase === "intro") {
      introContentItems.push(item);
    } else if (phase === "auteur") {
      overDeAuteurItems.push(item);
    } else if (phase === "auteur-links") {
      authorLinksItems.push(item);
    } else if (phase === "training") {
      trainingItems.push(item);
    }
  }

  // Store paginatitel and subtitel as rich content items
  result.paginaTitel = paginaTitelItems;
  result.paginaSubtitel = paginaSubtitelItems;

  // Parse rules — detect [Hoofdcategorie] and [Sections] markers
  const hoofdcatNames = [];
  const sectionMappings = {};
  let rulesSubPhase = null; // 'hoofdcat' | 'sections' | null

  for (const line of rulesLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === "[Hoofdcategorie]") {
      rulesSubPhase = "hoofdcat";
      continue;
    }
    if (trimmed === "[Sections]" || trimmed === "[Section]") {
      rulesSubPhase = "sections";
      continue;
    }
    // Any standalone bracket marker ends current sub-phase
    if (/^\[.+\]$/.test(trimmed) && trimmed !== "[Hoofdcategorie]") {
      rulesSubPhase = null;
      continue;
    }

    if (rulesSubPhase === "hoofdcat") {
      hoofdcatNames.push(trimmed);
      continue;
    }
    if (rulesSubPhase === "sections") {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0) {
        const key = trimmed.substring(0, colonIdx).trim();
        const values = trimmed
          .substring(colonIdx + 1)
          .trim()
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
        sectionMappings[key.toLowerCase()] = values;
      }
      continue;
    }
  }

  // Build hoofdcategorieën from parsed markers
  if (hoofdcatNames.length > 0) {
    result.hoofdcategorieën = hoofdcatNames.map((name) => {
      const mapped = sectionMappings[name.toLowerCase()];
      return {
        name,
        sections: mapped || [name],
      };
    });
    // Also build sectionOrder for backward compatibility
    result.sectionOrder = [];
    for (const hc of result.hoofdcategorieën) {
      for (const s of hc.sections) {
        if (!result.sectionOrder.includes(s)) {
          result.sectionOrder.push(s);
        }
      }
    }
  } else {
    // Fallback: old format "Dit zijn de [Sections]..."
    const rulesText = rulesLines.join("\n");
    const sectionMatch = rulesText.match(
      /Dit zijn de \[Sections\].*?:\s*([\s\S]*)/i,
    );
    if (sectionMatch) {
      result.sectionOrder = sectionMatch[1]
        .trim()
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  // Parse chatbots
  for (const line of chatbotLines) {
    const cleaned = line.replace(/^[-•*]\s*/, "").trim();
    if (!cleaned) continue;
    const semicolonIdx = cleaned.indexOf(";");
    if (semicolonIdx > 0) {
      const name = cleaned.substring(0, semicolonIdx).trim();
      const url = cleaned.substring(semicolonIdx + 1).trim();
      if (name && url) {
        result.chatbots.push({ name, url });
      }
    }
  }

  // Build introduction as a synthetic section
  if (introContentItems.length > 0) {
    result.introduction = {
      id: "section-intro",
      title: "Welkom!",
      level: 1,
      content: introContentItems,
      children: [],
    };
  }

  // Build over de auteur as a synthetic section
  if (overDeAuteurItems.length > 0) {
    result.overDeAuteur = {
      id: "section-auteur",
      title: "Over de auteur",
      level: 1,
      content: overDeAuteurItems,
      children: [],
    };
  }

  // Build training as a synthetic section
  if (trainingItems.length > 0) {
    result.training = {
      id: "section-training",
      title: "Trainingen",
      level: 1,
      content: trainingItems,
      children: [],
    };
  }

  // Parse author links from [Ook van deze auteur] section
  // Each item has format: "Label - URL;" where URL can be a hyperlink part OR an image imageName
  const authorLinksData = [];
  for (const item of authorLinksItems) {
    if (!item.parts) continue;

    const fullText = getItemText(item);
    if (!fullText) continue;

    // Extract label: everything before the last " - " or " – " separator
    // Clean out "(Volgt.)" and trailing semicolons/dashes
    let label = "";
    const dashIdx = fullText.search(/\s[-–]\s/);
    if (dashIdx > 0) {
      label = fullText.substring(0, dashIdx).trim();
    } else {
      // No dash separator — use all text, cleaned up
      label = fullText.replace(/;/g, "").trim();
    }

    // Clean up label: remove "(Volgt.)" but keep it as info
    const hasVolgt = label.includes("(Volgt.)");
    label = label.replace(/\(Volgt\.\)/g, "").trim();

    if (!label) continue;

    // Re-add "(Volgt.)" suffix to the label if present
    if (hasVolgt) {
      label = label + " (Volgt.)";
    }

    // Strategy 1: Find URL from link parts with a real href attribute
    let href = "";
    for (const part of item.parts) {
      if (part.link && part.href) {
        const candidate = part.href.replace(/;$/, "").trim();
        if (candidate && candidate.length > 3) {
          href = candidate;
          break;
        }
      }
    }

    // Strategy 2: Find URL from link parts using text (but only if it looks like a URL)
    if (!href) {
      for (const part of item.parts) {
        if (part.link && part.text) {
          const candidate = part.text.replace(/;$/, "").trim();
          // Must look like a URL (contains a dot and no spaces, or starts with http)
          if (
            candidate &&
            (candidate.startsWith("http") ||
              (candidate.includes(".") &&
                !candidate.includes(" ") &&
                candidate.length > 4))
          ) {
            href = candidate;
            break;
          }
        }
      }
    }

    // Strategy 3: Fall back to image parts — the imageName often contains the target URL
    if (!href) {
      for (const part of item.parts) {
        if (part.type === "image" && part.imageName) {
          const imgName = part.imageName;
          // Check if imageName looks like a URL
          if (imgName.startsWith("http://") || imgName.startsWith("https://")) {
            href = imgName.replace(/;$/, "").trim();
            break;
          }
        }
      }
    }

    // Normalize URL if found
    if (href) {
      const hasProtocol =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("ftp://");
      if (!hasProtocol && href.includes(".")) {
        href = "https://" + href;
      }
    }

    authorLinksData.push({ label, href: href || null });
  }
  result.authorLinks = authorLinksData;
}

export function parseAuteurPreamble(preamble, result) {
  const items = preamble.content;

  let phase = "before-start";
  let savedPhase = null;
  const overDeAuteurItems = [];
  const authorLinksItems = [];
  const trainingItems = [];

  for (const item of items) {
    const itemText = getItemText(item);

    if (itemText.includes("[Over de auteur]")) {
      phase = "auteur";
      continue;
    }

    if (itemText.includes("[Einde over de auteur]")) {
      phase = "after-auteur";
      continue;
    }

    // Sub-section within auteur for "Ook van deze auteur" links
    if (itemText.includes("[Ook van deze auteur]")) {
      phase = "auteur-links";
      continue;
    }

    if (itemText.includes("[Einde Ook van deze auteur]")) {
      phase = "auteur";
      continue;
    }

    if (itemText.includes("[TrainingenMenu]")) {
      phase = "training";
      continue;
    }

    if (itemText.includes("[Einde TrainingenMenu]")) {
      phase = "after-training";
      continue;
    }

    if (phase === "before-start") {
      // Still collect paginatitel/subtitel even before [Start loading here]
      continue;
    }

    if (phase === "auteur") {
      overDeAuteurItems.push(item);
      continue;
    } else if (phase === "auteur-links") {
      authorLinksItems.push(item);
      continue;
    } else if (phase === "training") {
      trainingItems.push(item);
      continue;
    }
  }

  // Build over de auteur as a synthetic section
  if (overDeAuteurItems.length > 0) {
    result.overDeAuteur = {
      id: "section-auteur",
      title: "Over de auteur",
      level: 1,
      content: overDeAuteurItems,
      children: [],
    };
  }

  // Build training as a synthetic section
  if (trainingItems.length > 0) {
    result.training = {
      id: "section-training",
      title: "Trainingen",
      level: 1,
      content: trainingItems,
      children: [],
    };
  }

  // Parse author links from [Ook van deze auteur] section
  // Each item has format: "Label - URL;" where URL can be a hyperlink part OR an image imageName
  const authorLinksData = [];
  for (const item of authorLinksItems) {
    if (!item.parts) continue;

    const fullText = getItemText(item);
    if (!fullText) continue;

    // Extract label: everything before the last " - " or " – " separator
    // Clean out "(Volgt.)" and trailing semicolons/dashes
    let label = "";
    const dashIdx = fullText.search(/\s[-–]\s/);
    if (dashIdx > 0) {
      label = fullText.substring(0, dashIdx).trim();
    } else {
      // No dash separator — use all text, cleaned up
      label = fullText.replace(/;/g, "").trim();
    }

    // Clean up label: remove "(Volgt.)" but keep it as info
    const hasVolgt = label.includes("(Volgt.)");
    label = label.replace(/\(Volgt\.\)/g, "").trim();

    if (!label) continue;

    // Re-add "(Volgt.)" suffix to the label if present
    if (hasVolgt) {
      label = label + " (Volgt.)";
    }

    // Strategy 1: Find URL from link parts with a real href attribute
    let href = "";
    for (const part of item.parts) {
      if (part.link && part.href) {
        const candidate = part.href.replace(/;$/, "").trim();
        if (candidate && candidate.length > 3) {
          href = candidate;
          break;
        }
      }
    }

    // Strategy 2: Find URL from link parts using text (but only if it looks like a URL)
    if (!href) {
      for (const part of item.parts) {
        if (part.link && part.text) {
          const candidate = part.text.replace(/;$/, "").trim();
          // Must look like a URL (contains a dot and no spaces, or starts with http)
          if (
            candidate &&
            (candidate.startsWith("http") ||
              (candidate.includes(".") &&
                !candidate.includes(" ") &&
                candidate.length > 4))
          ) {
            href = candidate;
            break;
          }
        }
      }
    }

    // Strategy 3: Fall back to image parts — the imageName often contains the target URL
    if (!href) {
      for (const part of item.parts) {
        if (part.type === "image" && part.imageName) {
          const imgName = part.imageName;
          // Check if imageName looks like a URL
          if (imgName.startsWith("http://") || imgName.startsWith("https://")) {
            href = imgName.replace(/;$/, "").trim();
            break;
          }
        }
      }
    }

    // Normalize URL if found
    if (href) {
      const hasProtocol =
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("ftp://");
      if (!hasProtocol && href.includes(".")) {
        href = "https://" + href;
      }
    }

    authorLinksData.push({ label, href: href || null });
  }
  result.authorLinks = authorLinksData;
}

function getItemText(item) {
  if (!item.parts) return "";
  return item.parts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join("")
    .trim();
}

function parsePromptSection(section) {
  if (!section.content || section.content.length === 0) return null;

  // Check if this section has prompt markers
  let hasMarkers = false;
  for (const item of section.content) {
    const t = getItemText(item);
    if (t === "[SECTION]" || t === "[PROMPT]" || t === "[CATEGORIES]") {
      hasMarkers = true;
      break;
    }
  }

  if (!hasMarkers) return null;

  const prompt = {
    name: section.title,
    section: [],
    categories: [],
    tags: [],
    taalmodel: "",
    promptText: "",
  };

  let currentMarker = null;
  const markerTexts = {
    section: [],
    categories: [],
    tags: [],
    taalmodel: [],
    prompt: [],
  };

  let afterPromptMarker = false;

  for (const item of section.content) {
    const itemText = getItemText(item);

    // Check for marker lines
    if (itemText === "[SECTION]") {
      currentMarker = "section";
      afterPromptMarker = false;
      continue;
    }
    if (itemText === "[CATEGORIES]") {
      currentMarker = "categories";
      afterPromptMarker = false;
      continue;
    }
    if (itemText === "[TAGS]") {
      currentMarker = "tags";
      afterPromptMarker = false;
      continue;
    }
    if (itemText === "[TAALMODEL]") {
      currentMarker = "taalmodel";
      afterPromptMarker = false;
      continue;
    }
    if (itemText === "[PROMPT]") {
      currentMarker = "prompt";
      afterPromptMarker = true;
      continue;
    }

    // Skip empty content unless we're collecting prompt text
    if (!itemText) {
      if (afterPromptMarker) {
        markerTexts.prompt.push("");
      }
      continue;
    }

    // Assign text to the current marker
    if (currentMarker && markerTexts[currentMarker] !== undefined) {
      markerTexts[currentMarker].push(itemText);
    }
  }

  // Process extracted marker texts
  const sectionText = markerTexts.section.join(" ").trim();
  prompt.section = sectionText
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  const categoriesText = markerTexts.categories.join(" ").trim();
  prompt.categories = categoriesText
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  const tagsText = markerTexts.tags.join(" ").trim();
  prompt.tags = tagsText
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  prompt.taalmodel = markerTexts.taalmodel.join(" ").trim();

  prompt.promptText = markerTexts.prompt.join("\n").trim();

  // The first line of the prompt text is often the same as the title, remove duplication
  const promptLines = prompt.promptText.split("\n");
  if (promptLines.length > 0 && promptLines[0].trim() === prompt.name.trim()) {
    prompt.promptText = promptLines.slice(1).join("\n").trim();
  }

  return prompt;
}
