import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

const clientVersion = packageJson.dependencies?.["@prisma/client"];
const cliVersion = packageJson.devDependencies?.prisma;
const adapterVersion = packageJson.dependencies?.["@prisma/adapter-pg"];
const pgVersion = packageJson.dependencies?.pg;

function parseExactVersion(name, version) {
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`${name} sürümü tam semantik sürüm olarak sabitlenmelidir.`);
  }

  const [major, minor, patch] = version.split(".").map(Number);
  return { major, minor, patch, raw: version };
}

const client = parseExactVersion("@prisma/client", clientVersion);
const cli = parseExactVersion("prisma", cliVersion);
const adapter = parseExactVersion("@prisma/adapter-pg", adapterVersion);
parseExactVersion("pg", pgVersion);

if (client.raw !== cli.raw) {
  throw new Error(
    `Prisma CLI ve Client sürümleri eşleşmiyor: prisma=${cli.raw}, @prisma/client=${client.raw}`,
  );
}

if (adapter.major !== client.major || adapter.minor !== client.minor) {
  throw new Error(
    `PostgreSQL adapter, Prisma ile aynı major/minor serisinde olmalıdır: adapter=${adapter.raw}, client=${client.raw}`,
  );
}

console.log(
  `Prisma sürüm seti doğrulandı: CLI/Client ${client.raw}, PostgreSQL adapter ${adapter.raw}.`,
);
