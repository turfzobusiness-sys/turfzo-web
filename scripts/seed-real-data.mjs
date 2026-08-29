import fs from "fs";
import path from "path";

// 1. Read and parse .env.local file
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env.local file not found in project root.");
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, "utf8");
  const env = {};
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
  return env;
}

const env = loadEnv();
const deploymentUrl = env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL;

if (!deploymentUrl) {
  console.error("Error: NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL is not set in .env.local");
  process.exit(1);
}

console.log(`Connecting to Convex deployment: ${deploymentUrl}`);

// Helper to invoke a Convex function
async function invokeConvex(type, funcPath, args = {}) {
  const url = `${deploymentUrl.replace(/\/+$/, "")}/api/${type}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: funcPath, args }),
  });

  const payload = await response.json();
  if (!response.ok || payload.status !== "success") {
    throw new Error(`Convex error: ${payload.errorMessage || payload.message || "Unknown error"}`);
  }
  return payload.value;
}

// Helper to upload a file to Convex storage
async function uploadFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Local file not found: ${absolutePath}`);
  }

  console.log(`Uploading ${filePath} to Convex storage...`);
  const fileBuffer = fs.readFileSync(absolutePath);

  // Step A: Generate upload URL
  const uploadUrl = await invokeConvex("mutation", "files:generateUploadUrl", {});

  // Step B: POST file to the upload URL
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to Convex storage. HTTP ${response.status}`);
  }

  const result = await response.json();
  console.log(`Uploaded successfully. Storage ID: ${result.storageId}`);
  return result.storageId;
}

async function main() {
  try {
    // 2. Upload the images
    const footballStorageId = await uploadFile("public/images/football_turf_premium.webp");
    const cricketStorageId = await uploadFile("public/images/cricket_nets_professional.webp");
    const badmintonStorageId = await uploadFile("public/images/badminton_court_wooden.webp");
    const tennisStorageId = await uploadFile("public/images/tennis_court_clay.webp");
    const trophyStorageId = await uploadFile("public/images/tournament_trophy.webp");

    console.log("\nAll images uploaded successfully. Running seed database mutation...");

    // 3. Run seed mutation with the uploaded storage IDs
    const seedResult = await invokeConvex("mutation", "seed:seedAll", {
      footballStorageId,
      cricketStorageId,
      badmintonStorageId,
      tennisStorageId,
      trophyStorageId,
    });

    console.log("\nDatabase Seeding Completed Successfully! 🎉");
    console.log(`- Turfs Seeded: ${seedResult.turfsSeeded}`);
    console.log(`- Tournaments Seeded: ${seedResult.tournamentsSeeded}`);
    console.log(`- Associated Owner User: ${seedResult.ownerEmail}`);
  } catch (error) {
    console.error("\nFailed to seed database:", error.message);
    process.exit(1);
  }
}

main();
