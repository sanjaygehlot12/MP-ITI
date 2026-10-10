import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET_KEY")!;
const RATE_LIMIT_SECRET = Deno.env.get("RATE_LIMIT_SECRET")!;
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 10;

const DOCUMENT_FIELDS = [
  { names: ["marksheet10"], folder: "marksheet10", type: "10th Marksheet", imagesOnly: false },
  { names: ["aadhaar"], folder: "aadhaar", type: "Aadhaar Card", imagesOnly: false },
  { names: ["samagra"], folder: "samagra", type: "Samagra ID", imagesOnly: false },
  { names: ["photographs[]", "photographs"], folder: "photographs", type: "Photograph", imagesOnly: true },
  { names: ["domicile"], folder: "domicile", type: "Domicile Certificate", imagesOnly: false },
  { names: ["caste"], folder: "caste", type: "Caste Certificate", imagesOnly: false },
  { names: ["income"], folder: "income", type: "Income Certificate", imagesOnly: false },
  { names: ["tc"], folder: "tc", type: "Transfer Certificate", imagesOnly: false },
];

function json(data: unknown, status = 200, origin?: string) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  }

  return new Response(JSON.stringify(data), { status, headers });
}

function cleanName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150) || "document";
}

function currentSession() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  return month >= 4
    ? `${year}-${String(year + 1).slice(-2)}`
    : `${year - 1}-${String(year).slice(-2)}`;
}

async function verifyTurnstile(token: string, ip: string | null) {
  const body = new URLSearchParams({
    secret: TURNSTILE_SECRET,
    response: token,
  });

  if (ip) body.set("remoteip", ip);

  const result = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!result.ok) return false;

  const data = await result.json();
  return data.success === true;
}

async function hashIp(ip: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(RATE_LIMIT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(ip),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function validFile(file: File, imagesOnly: boolean) {
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) return false;

  const name = file.name.toLowerCase();
  const buffer = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  const isPDF =
    name.endsWith(".pdf") &&
    buffer.length >= 5 &&
    String.fromCharCode(...buffer.slice(0, 5)) === "%PDF-";

  const isJPEG =
    name.match(/\.(jpg|jpeg)$/) &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPNG =
    name.endsWith(".png") &&
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  return imagesOnly
    ? Boolean(isJPEG || isPNG)
    : Boolean(isPDF || isJPEG || isPNG);
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return json({ success: false, message: "Origin not allowed." }, 403);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ success: false, message: "Only POST is allowed." }, 405, origin);
  }

  let admissionId: number | null = null;
  const uploadedPaths: string[] = [];

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);

    if (contentLength > MAX_TOTAL_SIZE + 1024 * 1024) {
      return json({ success: false, message: "Total upload size is too large." }, 413, origin);
    }

    const form = await req.formData();

    const studentName = String(form.get("studentName") || "").trim();
    const fatherName = String(form.get("fatherName") || "").trim();
    const motherName = String(form.get("motherName") || "").trim();
    const dob = String(form.get("dob") || "").trim();
    const mobile = String(form.get("mobile") || "").trim();
    const email = String(form.get("email") || "").trim();
    const address = String(form.get("address") || "").trim();
    const qualification = String(form.get("qualification") || "").trim();
    const trade = String(form.get("trade") || "").trim();

    if (
      !studentName || studentName.length > 120 ||
      !/^[6-9]\d{9}$/.test(mobile) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      !trade || trade.length > 100 ||
      fatherName.length > 120 ||
      motherName.length > 120 ||
      address.length > 1000 ||
      qualification.length > 100
    ) {
      return json({ success: false, message: "Please check the application details." }, 400, origin);
    }

    if (dob) {
      const parsedDob = new Date(`${dob}T00:00:00Z`);

      if (
        Number.isNaN(parsedDob.getTime()) ||
        parsedDob.toISOString().slice(0, 10) !== dob ||
        parsedDob > new Date()
      ) {
        return json({ success: false, message: "Please enter a valid date of birth." }, 400, origin);
      }
    }

    const token = String(form.get("cf-turnstile-response") || "");

    if (!token || token.length > 2048) {
      return json({ success: false, message: "Please complete the security verification." }, 400, origin);
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim() || null;

    if (!await verifyTurnstile(token, ip)) {
      return json({ success: false, message: "Security verification failed. Please try again." }, 403, origin);
    }

    // Hash the request IP without storing the raw address.
    // If the platform does not supply an IP, reject rather than share a single global rate-limit bucket.
    if (!ip || ip.length > 100) {
      return json({ success: false, message: "Unable to verify the request source. Please try again." }, 400, origin);
    }

    const ipHash = await hashIp(ip);

    const { data: allowed, error: rateError } = await supabase.rpc(
      "check_admission_rate_limit",
      { p_ip_hash: ipHash },
    );

    if (rateError) {
      console.error("Rate-limit check failed:", rateError);
      return json({ success: false, message: "Security check temporarily unavailable." }, 503, origin);
    }

    if (allowed !== true) {
      return json({ success: false, message: "Too many attempts. Please try again after 15 minutes." }, 429, origin);
    }

    // Ignore any client-supplied session; calculate it on the server.
    const session = currentSession();

    const files: { field: typeof DOCUMENT_FIELDS[number]; file: File }[] = [];
    let totalSize = 0;

    for (const field of DOCUMENT_FIELDS) {
      for (const inputName of field.names) {
        for (const item of form.getAll(inputName)) {
          if (!(item instanceof File) || item.size === 0) continue;

          files.push({ field, file: item });
          totalSize += item.size;
        }
      }
    }

    if (files.length > MAX_FILES || totalSize > MAX_TOTAL_SIZE) {
      return json({ success: false, message: "Too many documents or total upload size exceeds 20 MB." }, 400, origin);
    }

    for (const { field, file } of files) {
      if (!await validFile(file, field.imagesOnly)) {
        return json({
          success: false,
          message: `Invalid file format or size: ${cleanName(file.name)}. Maximum size is 5 MB.`,
        }, 400, origin);
      }
    }

    const { data: admission, error: insertError } = await supabase
      .from("admissions")
      .insert({
        name: studentName,
        father_name: fatherName || null,
        mother_name: motherName || null,
        dob: dob || null,
        mobile,
        email,
        address: address || null,
        qualification: qualification || null,
        trade,
        session,
        status: "New",
      })
      .select("id")
      .single();

    if (insertError || !admission) {
      console.error("Admission insert error:", insertError);
      return json({ success: false, message: "Unable to create admission application." }, 500, origin);
    }

    admissionId = admission.id;

    for (const { field, file } of files) {
      const filePath =
        `${admissionId}/${field.folder}/${crypto.randomUUID()}_${cleanName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("admission-documents")
        .upload(filePath, await file.arrayBuffer(), {
          contentType: file.name.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : file.name.toLowerCase().endsWith(".png")
            ? "image/png"
            : "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("A document could not be uploaded. Please try again.");
      }

      uploadedPaths.push(filePath);

      const { error: docError } = await supabase
        .from("admission_documents")
        .insert({
          admission_id: admissionId,
          document_type: field.type,
          file_name: cleanName(file.name),
          file_path: filePath,
          status: "Pending",
        });

      if (docError) {
        console.error("Document record error:", docError);
        throw new Error("Document details could not be saved.");
      }
    }

    return json({
      success: true,
      message: "Admission application submitted successfully.",
      admission_id: admissionId,
    }, 200, origin);
  } catch (error) {
    console.error("Admission submission failed:", error);

    if (uploadedPaths.length) {
      const { error: cleanupError } = await supabase.storage
        .from("admission-documents")
        .remove(uploadedPaths);

      if (cleanupError) console.error("Storage cleanup failed:", cleanupError);
    }

    if (admissionId !== null) {
      const { error: cleanupError } = await supabase
        .from("admissions")
        .delete()
        .eq("id", admissionId);

      if (cleanupError) console.error("Admission cleanup failed:", cleanupError);
    }

    return json({
      success: false,
      message: error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
    }, 500, origin);
  }
});