import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type CleanupSummary = {
  products: number;
  productImages: number;
  showcases: number;
  showcaseImages: number;
  colors: number;
  orders: number;
  orderItems: number;
};

const PRODUCT_BUCKET = "product-images";
const SHOWCASE_BUCKET = "showcase-images";

let supabaseAdmin: SupabaseClient | null = null;

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase env for QA cleanup.");
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

function extractStoragePath(url: string, bucket: string) {
  const bucketPath = `/storage/v1/object/public/${bucket}/`;
  const bucketIndex = url.indexOf(bucketPath);

  if (bucketIndex === -1) {
    return url.split("/").pop() ?? null;
  }

  return decodeURIComponent(url.substring(bucketIndex + bucketPath.length));
}

async function removeStoragePaths(bucket: string, urls: string[]) {
  const paths = [...new Set(urls.map((url) => extractStoragePath(url, bucket)).filter((path): path is string => Boolean(path)))];

  if (paths.length === 0) {
    return 0;
  }

  const { error } = await getSupabaseAdmin().storage.from(bucket).remove(paths);
  if (error) {
    throw new Error(`Failed to remove ${bucket} assets: ${error.message}`);
  }

  return paths.length;
}

async function cleanupOrderItemsForProductIds(productIds: string[]) {
  if (productIds.length === 0) {
    return { deletedOrderItems: 0, deletedOrders: 0 };
  }

  const supabase = getSupabaseAdmin();
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("OrderItem")
    .select("id, orderId")
    .in("productId", productIds);

  if (orderItemsError) {
    throw new Error(`Failed to load QA-linked order items: ${orderItemsError.message}`);
  }

  const linkedOrderItems = (orderItems ?? []) as { id: string; orderId: string }[];
  if (linkedOrderItems.length === 0) {
    return { deletedOrderItems: 0, deletedOrders: 0 };
  }

  const orderIds = [...new Set(linkedOrderItems.map((item) => item.orderId))];

  const { error: deleteItemsError } = await supabase
    .from("OrderItem")
    .delete()
    .in("productId", productIds);

  if (deleteItemsError) {
    throw new Error(`Failed to delete QA-linked order items: ${deleteItemsError.message}`);
  }

  const { data: remainingOrderItems, error: remainingItemsError } = await supabase
    .from("OrderItem")
    .select("orderId")
    .in("orderId", orderIds);

  if (remainingItemsError) {
    throw new Error(`Failed to check remaining order items: ${remainingItemsError.message}`);
  }

  const remainingOrderIds = new Set(
    ((remainingOrderItems ?? []) as { orderId: string }[]).map((item) => item.orderId)
  );
  const orphanedOrderIds = orderIds.filter((orderId) => !remainingOrderIds.has(orderId));

  if (orphanedOrderIds.length === 0) {
    return { deletedOrderItems: linkedOrderItems.length, deletedOrders: 0 };
  }

  const { error: deleteOrdersError } = await supabase
    .from("Order")
    .delete()
    .in("id", orphanedOrderIds);

  if (deleteOrdersError) {
    throw new Error(`Failed to delete orphaned QA orders: ${deleteOrdersError.message}`);
  }

  return {
    deletedOrderItems: linkedOrderItems.length,
    deletedOrders: orphanedOrderIds.length,
  };
}

export async function cleanupQaProductByBaseName(baseName: string): Promise<CleanupSummary> {
  const summary: CleanupSummary = {
    products: 0,
    productImages: 0,
    showcases: 0,
    showcaseImages: 0,
    colors: 0,
    orders: 0,
    orderItems: 0,
  };

  if (!baseName.trim()) {
    return summary;
  }

  const { data: products, error } = await getSupabaseAdmin()
    .from("Product")
    .select("id, images")
    .eq("baseName", baseName);

  if (error) {
    throw new Error(`Failed to load QA products: ${error.message}`);
  }

  const productRows = (products ?? []) as { id: string; images: string[] | null }[];
  if (productRows.length === 0) {
    return summary;
  }

  const orderCleanup = await cleanupOrderItemsForProductIds(productRows.map((product) => product.id));
  summary.orderItems = orderCleanup.deletedOrderItems;
  summary.orders = orderCleanup.deletedOrders;

  summary.productImages = await removeStoragePaths(
    PRODUCT_BUCKET,
    productRows.flatMap((product) => product.images ?? [])
  );

  const { error: deleteError } = await getSupabaseAdmin()
    .from("Product")
    .delete()
    .eq("baseName", baseName);

  if (deleteError) {
    throw new Error(`Failed to delete QA products: ${deleteError.message}`);
  }

  summary.products = productRows.length;
  return summary;
}

export async function cleanupQaShowcaseByTitle(title: string): Promise<CleanupSummary> {
  const summary: CleanupSummary = {
    products: 0,
    productImages: 0,
    showcases: 0,
    showcaseImages: 0,
    colors: 0,
    orders: 0,
    orderItems: 0,
  };

  if (!title.trim()) {
    return summary;
  }

  const { data: showcases, error } = await getSupabaseAdmin()
    .from("Showcase")
    .select("id, image_url")
    .eq("title", title);

  if (error) {
    throw new Error(`Failed to load QA showcases: ${error.message}`);
  }

  const showcaseRows = (showcases ?? []) as { id: string; image_url: string }[];
  if (showcaseRows.length === 0) {
    return summary;
  }

  summary.showcaseImages = await removeStoragePaths(
    SHOWCASE_BUCKET,
    showcaseRows.map((showcase) => showcase.image_url)
  );

  const { error: deleteError } = await getSupabaseAdmin()
    .from("Showcase")
    .delete()
    .eq("title", title);

  if (deleteError) {
    throw new Error(`Failed to delete QA showcases: ${deleteError.message}`);
  }

  summary.showcases = showcaseRows.length;
  return summary;
}

export async function cleanupQaColorByName(name: string): Promise<CleanupSummary> {
  const summary: CleanupSummary = {
    products: 0,
    productImages: 0,
    showcases: 0,
    showcaseImages: 0,
    colors: 0,
    orders: 0,
    orderItems: 0,
  };

  if (!name.trim()) {
    return summary;
  }

  const { data: colors, error } = await getSupabaseAdmin()
    .from("Color")
    .select("id")
    .eq("name", name);

  if (error) {
    throw new Error(`Failed to load QA colors: ${error.message}`);
  }

  const colorRows = (colors ?? []) as { id: string }[];
  if (colorRows.length === 0) {
    return summary;
  }

  const { error: deleteError } = await getSupabaseAdmin()
    .from("Color")
    .delete()
    .eq("name", name);

  if (deleteError) {
    throw new Error(`Failed to delete QA colors: ${deleteError.message}`);
  }

  summary.colors = colorRows.length;
  return summary;
}

export async function cleanupQaOrderByEmail(email: string): Promise<CleanupSummary> {
  const summary: CleanupSummary = {
    products: 0,
    productImages: 0,
    showcases: 0,
    showcaseImages: 0,
    colors: 0,
    orders: 0,
    orderItems: 0,
  };

  if (!email.trim()) {
    return summary;
  }

  const { data: orders, error } = await getSupabaseAdmin()
    .from("Order")
    .select("id")
    .eq("customerEmail", email);

  if (error) {
    throw new Error(`Failed to load QA orders: ${error.message}`);
  }

  const orderRows = (orders ?? []) as { id: string }[];
  if (orderRows.length === 0) {
    return summary;
  }

  const orderIds = orderRows.map((order) => order.id);

  const { error: deleteItemsError } = await getSupabaseAdmin()
    .from("OrderItem")
    .delete()
    .in("orderId", orderIds);

  if (deleteItemsError) {
    throw new Error(`Failed to delete QA order items: ${deleteItemsError.message}`);
  }

  const { error: deleteOrdersError } = await getSupabaseAdmin()
    .from("Order")
    .delete()
    .in("id", orderIds);

  if (deleteOrdersError) {
    throw new Error(`Failed to delete QA orders: ${deleteOrdersError.message}`);
  }

  summary.orderItems = orderIds.length;
  summary.orders = orderRows.length;
  return summary;
}

export async function cleanupAllQaData(dryRun = false): Promise<CleanupSummary> {
  const summary: CleanupSummary = {
    products: 0,
    productImages: 0,
    showcases: 0,
    showcaseImages: 0,
    colors: 0,
    orders: 0,
    orderItems: 0,
  };

  const supabase = getSupabaseAdmin();

  const [{ data: products, error: productsError }, { data: showcases, error: showcasesError }, { data: colors, error: colorsError }, { data: orders, error: ordersError }] =
    await Promise.all([
      supabase.from("Product").select("id, baseName, images").ilike("baseName", "QA Product %"),
      supabase.from("Showcase").select("id, title, image_url").ilike("title", "QA Showcase %"),
      supabase.from("Color").select("id, name").ilike("name", "QA Smoke %"),
      supabase.from("Order").select("id, customerEmail").ilike("customerEmail", "qa-order-%@example.com"),
    ]);

  if (productsError) throw new Error(`Failed to list QA products: ${productsError.message}`);
  if (showcasesError) throw new Error(`Failed to list QA showcases: ${showcasesError.message}`);
  if (colorsError) throw new Error(`Failed to list QA colors: ${colorsError.message}`);
  if (ordersError) throw new Error(`Failed to list QA orders: ${ordersError.message}`);

  const productRows = (products ?? []) as { id: string; baseName: string; images: string[] | null }[];
  const showcaseRows = (showcases ?? []) as { id: string; title: string; image_url: string }[];
  const colorRows = (colors ?? []) as { id: string; name: string }[];
  const orderRows = (orders ?? []) as { id: string; customerEmail: string }[];
  const { data: linkedProductOrderItems, error: linkedProductOrderItemsError } = await supabase
    .from("OrderItem")
    .select("id, orderId, productId")
    .in("productId", productRows.map((product) => product.id));

  if (linkedProductOrderItemsError) {
    throw new Error(`Failed to list QA-linked order items: ${linkedProductOrderItemsError.message}`);
  }

  const linkedOrderIds = new Set(
    ((linkedProductOrderItems ?? []) as { orderId: string }[]).map((item) => item.orderId)
  );
  const qaOrderIds = new Set(orderRows.map((order) => order.id));

  summary.products = productRows.length;
  summary.productImages = [...new Set(productRows.flatMap((product) => product.images ?? []))].length;
  summary.showcases = showcaseRows.length;
  summary.showcaseImages = showcaseRows.length;
  summary.colors = colorRows.length;
  summary.orders = new Set([...qaOrderIds, ...linkedOrderIds]).size;
  summary.orderItems = ((linkedProductOrderItems ?? []) as { id: string }[]).length;

  if (dryRun) {
    return summary;
  }

  if (orderRows.length > 0) {
    const orderIds = orderRows.map((order) => order.id);
    const { error: deleteItemsError } = await supabase.from("OrderItem").delete().in("orderId", orderIds);
    if (deleteItemsError) throw new Error(`Failed to delete QA order items: ${deleteItemsError.message}`);

    const { error: deleteOrdersError } = await supabase.from("Order").delete().in("id", orderIds);
    if (deleteOrdersError) throw new Error(`Failed to delete QA orders: ${deleteOrdersError.message}`);
  }

  if (showcaseRows.length > 0) {
    await removeStoragePaths(SHOWCASE_BUCKET, showcaseRows.map((showcase) => showcase.image_url));
    const { error: deleteShowcasesError } = await supabase.from("Showcase").delete().ilike("title", "QA Showcase %");
    if (deleteShowcasesError) throw new Error(`Failed to delete QA showcases: ${deleteShowcasesError.message}`);
  }

  if (productRows.length > 0) {
    await cleanupOrderItemsForProductIds(productRows.map((product) => product.id));
    await removeStoragePaths(PRODUCT_BUCKET, productRows.flatMap((product) => product.images ?? []));
    const { error: deleteProductsError } = await supabase.from("Product").delete().ilike("baseName", "QA Product %");
    if (deleteProductsError) throw new Error(`Failed to delete QA products: ${deleteProductsError.message}`);
  }

  if (colorRows.length > 0) {
    const { error: deleteColorsError } = await supabase.from("Color").delete().ilike("name", "QA Smoke %");
    if (deleteColorsError) throw new Error(`Failed to delete QA colors: ${deleteColorsError.message}`);
  }

  return summary;
}
