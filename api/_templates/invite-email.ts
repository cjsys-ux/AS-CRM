export const INVITE_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #9333ea, #a855f7); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Welcome to ActivateSwag!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; margin-top: 0;">Hi {{firstName}},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We're excited to have you join {{companyName}}! Your account has been created and you're ready to get started.
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                To complete your setup, please create your password by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{activationLink}}" style="display: inline-block; background: linear-gradient(to right, #9333ea, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Create Password</a>
                  </td>
                </tr>
              </table>

              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                If you didn't request this account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                &copy; {{currentYear}} ActivateSwag. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function renderInviteEmail(vars: {
  firstName: string;
  companyName: string;
  activationLink: string;
  currentYear: string;
}): string {
  return INVITE_EMAIL_TEMPLATE
    .replace(/\{\{firstName\}\}/g, vars.firstName)
    .replace(/\{\{companyName\}\}/g, vars.companyName)
    .replace(/\{\{activationLink\}\}/g, vars.activationLink)
    .replace(/\{\{currentYear\}\}/g, vars.currentYear);
}
