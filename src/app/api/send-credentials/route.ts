import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, fullName, course } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // -------------------------------------------------------------------------
    // 💡 TESTING HARDCODE BYPASS (Bypass successfully aligned with your App Password)
    // -------------------------------------------------------------------------
    const emailUser = process.env.EMAIL_USER || "highrisedigitalagency@gmail.com";
    
    // 🎯 Aapka 16-character ka App Password bina spaces ke yahan set ho gaya hai:
    const emailPass = process.env.EMAIL_PASS || "ijvjrxrxaaukudbn"; 
    // -------------------------------------------------------------------------

    // SMTP Transporter Configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass, 
      },
    });

    const mailOptions = {
      from: `"HRD LMS Portal" <${emailUser}>`,
      to: email,
      subject: "🎉 Admission Approved - HRD LMS Access Granted!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f5; color: #18181b;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h2 style="color: #10b981; margin-top: 0;">Assalam-o-Alaikum, ${fullName}!</h2>
            <p style="font-size: 16px; line-height: 1.5;">We are thrilled to inform you that your fee verification is successful and your admission has been <strong>Approved</strong>!</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #14532d;">Enrolled Course Path:</p>
              <p style="margin: 5px 0 0 0; text-transform: uppercase; color: #166534; font-weight: 800;">${course || "N/A"}</p>
            </div>

            <p style="font-size: 14px; color: #52525b;">You can now log in to your student dashboard using your registered account to start accessing your batch lectures.</p>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 25px 0;" />
            <p style="font-size: 12px; color: #71717a; margin: 0; text-align: center;">This is an automated email from HRD Desk Engine.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${email}`);

    return NextResponse.json({ success: true, message: "Email sent successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ CRITICAL EMAIL ROUTE ERROR:", error.message || error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}