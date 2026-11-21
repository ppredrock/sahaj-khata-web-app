"use server";

import { revalidatePath } from "next/cache";
import { createGallaTransaction } from "@/lib/queries/galla";
import { createUdharTransaction, settleUdharTransaction } from "@/lib/queries/udhar";
import { createContact } from "@/lib/queries/contacts";
import { saveDailyClosing } from "@/lib/queries/closing";
import { updateProfile } from "@/lib/queries/profile";
import { getTodayDateString } from "@/lib/utils";

// ─── Galla Actions ────────────────────────────────────────────────────────────
export async function addGallaAction(formData: FormData) {
  const type = formData.get("type") as "inflow" | "outflow";
  const amount = parseFloat(formData.get("amount") as string);
  const category = (formData.get("category") as any) || (type === "inflow" ? "sale" : "expense");
  const description = formData.get("description") as string;
  const paymentMode = (formData.get("paymentMode") as string) || "cash";
  const date = (formData.get("date") as string) || getTodayDateString();

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "कृपया मान्य राशि दर्ज करें।" };
  }

  await createGallaTransaction({
    date,
    type,
    amount,
    category,
    description,
    paymentMode,
  });

  revalidatePath("/");
  revalidatePath("/galla");
  revalidatePath("/reports");
  return { success: true };
}

// ─── Udhar Actions ────────────────────────────────────────────────────────────
export async function addUdharAction(formData: FormData) {
  const type = formData.get("type") as "given" | "received";
  const amount = parseFloat(formData.get("amount") as string);
  let contactId = formData.get("contactId") as string;
  const contactName = formData.get("newContactName") as string;
  const contactPhone = formData.get("newContactPhone") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("dueDate") as string;
  const syncToGalla = formData.get("syncToGalla") === "true";
  const date = (formData.get("date") as string) || getTodayDateString();

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "कृपया मान्य राशि दर्ज करें।" };
  }

  // Create new contact if requested on the fly
  if ((!contactId || contactId === "new") && contactName && contactName.trim() !== "") {
    const newContact = await createContact({
      name: contactName.trim(),
      phone: contactPhone?.trim() || null,
      type: type === "given" ? "customer" : "supplier",
    });
    contactId = newContact.id;
  }

  if (!contactId) {
    return { success: false, error: "कृपया पार्टी (Contact) चुनें या नया नाम दर्ज करें।" };
  }

  await createUdharTransaction(
    {
      date,
      type,
      amount,
      contactId,
      description,
      dueDate: dueDate || null,
    },
    syncToGalla
  );

  revalidatePath("/");
  revalidatePath("/udhar");
  revalidatePath("/contacts");
  revalidatePath("/galla");
  return { success: true };
}

// ─── Contact Actions ──────────────────────────────────────────────────────────
export async function addContactAction(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const type = (formData.get("type") as "customer" | "supplier" | "both") || "customer";
  const notes = formData.get("notes") as string;

  if (!name || name.trim() === "") {
    return { success: false, error: "नाम आवश्यक है।" };
  }

  await createContact({
    name: name.trim(),
    phone: phone?.trim() || null,
    type,
    notes: notes?.trim() || null,
  });

  revalidatePath("/contacts");
  revalidatePath("/udhar");
  return { success: true };
}

// ─── Settlement Action ────────────────────────────────────────────────────────
export async function settleUdharAction(id: string, syncToGalla: boolean = false) {
  await settleUdharTransaction(id, getTodayDateString(), syncToGalla);

  revalidatePath("/");
  revalidatePath("/udhar");
  revalidatePath("/contacts");
  revalidatePath("/galla");
  return { success: true };
}

// ─── Daily Closing Action ─────────────────────────────────────────────────────
export async function closeRegisterAction(data: {
  date: string;
  openingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  expectedBalance: number;
  actualBalance: number;
  mismatchNote?: string;
}) {
  await saveDailyClosing(data);

  revalidatePath("/");
  revalidatePath("/galla");
  revalidatePath("/reports");
  return { success: true };
}

// ─── Profile Update Action ────────────────────────────────────────────────────
export async function updateProfileAction(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const ownerName = formData.get("ownerName") as string;
  const phone = formData.get("phone") as string;
  const upiId = formData.get("upiId") as string;
  const address = formData.get("address") as string;
  const pin = formData.get("pin") as string;

  await updateProfile({
    storeName,
    ownerName,
    phone,
    upiId,
    address,
    pin: pin || undefined,
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}
