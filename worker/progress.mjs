const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function emptyProgress() {
  return { version: 1, updatedAt: null, solved: [] };
}

export function applyToggle(doc, slug, solved, now) {
  if (typeof slug !== "string" || !slugPattern.test(slug)) {
    return { error: "Unknown problem." };
  }
  if (typeof solved !== "boolean") {
    return { error: "Expected solved to be true or false." };
  }

  const current = Array.isArray(doc?.solved)
    ? doc.solved.filter((item) => typeof item === "string")
    : [];
  const has = current.includes(slug);
  if (solved === has) {
    return {
      changed: false,
      doc: {
        version: 1,
        updatedAt: doc?.updatedAt ?? null,
        solved: [...current].sort(),
      },
    };
  }

  const next = solved
    ? [...current, slug].sort()
    : current.filter((item) => item !== slug);

  return {
    changed: true,
    doc: { version: 1, updatedAt: now, solved: next },
  };
}

export function encodeProgress(doc) {
  return JSON.stringify(doc, null, 2) + "\n";
}
