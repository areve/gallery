// eslint-disable-next-line no-undef
if (!/yarn/.test(process.env.npm_execpath || "")) {
  console.warn("This repository requires yarn, yarn.lock is important!");
  // eslint-disable-next-line no-undef
  process.exit(1);
}
