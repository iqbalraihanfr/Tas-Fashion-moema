import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const bucketName = "showcase-images";
  console.log(`Ensuring bucket '${bucketName}' exists...`);

  // Try to create the bucket
  const { error } = await supabaseAdmin.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 5242880, // 5MB limit
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (error) {
    if (error.message.includes("already exists") || error.message.includes("duplicate key")) {
      console.log(`Bucket '${bucketName}' already exists.`);
    } else {
      console.error(`Failed to create bucket:`, error);
      process.exit(1);
    }
  } else {
    console.log(`Bucket '${bucketName}' created successfully.`);
  }

  // Ensure bucket is public
  const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });

  if (updateError) {
    console.error(`Failed to make bucket public:`, updateError);
  } else {
    console.log(`Bucket '${bucketName}' configuration updated successfully (set to public).`);
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
