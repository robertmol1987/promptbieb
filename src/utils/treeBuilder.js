export function buildTree(sections) {
  const tree = [];
  const stack = [];
  for (const section of sections) {
    const node = { ...section, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level)
      stack.pop();
    if (stack.length === 0) tree.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return tree;
}
