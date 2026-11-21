export function generateWhatsAppReminderLink(params: {
  phone: string;
  customerName: string;
  storeName: string;
  amount: number;
  upiId?: string | null;
  language?: "hi" | "en";
}): string {
  const cleanPhone = params.phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let text = "";
  if (params.language === "en") {
    text = `Hello ${params.customerName} ji, this is a gentle reminder from ${params.storeName}. Your outstanding balance is ₹${params.amount.toLocaleString("en-IN")}.`;
    if (params.upiId) {
      text += ` You can pay via UPI to: ${params.upiId}`;
    }
    text += ` Thank you!`;
  } else {
    text = `नमस्ते ${params.customerName} जी, ${params.storeName} से विनम्र निवेदन है। आपके खाते का कुल ₹${params.amount.toLocaleString("en-IN")} का हिसाब बाकी है।`;
    if (params.upiId) {
      text += ` आप इस UPI ID पर भुगतान कर सकते हैं: ${params.upiId}`;
    }
    text += ` कृपया जल्द भुगतान करने की कृपा करें। धन्यवाद!`;
  }

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}
