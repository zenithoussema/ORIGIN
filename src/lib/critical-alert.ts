export async function sendCriticalAlert(params: {
  context?: string;
  message: string;
  userId?: string;
  requestId?: string;
  error?: string;
  stack?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { sendEmail } = await import('@/lib/email');
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@origin.sa',
      subject: `[CRITICAL] ORIGIN Server Alert - ${params.context || 'Unknown'}`,
      html: `
        <h2 style="color: #dc2626;">Critical Error Alert</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Level</strong></td><td style="padding: 8px; border: 1px solid #ddd;">CRITICAL</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Context</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${params.context || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${params.message}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>User</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${params.userId || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Timestamp</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${new Date().toISOString()}</td></tr>
          ${params.error ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Error</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><pre style="white-space: pre-wrap;">${params.error}</pre></td></tr>` : ''}
          ${params.metadata ? `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Metadata</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><pre style="white-space: pre-wrap;">${JSON.stringify(params.metadata, null, 2)}</pre></td></tr>` : ''}
        </table>
      `,
    });
  } catch {
    // Don't crash if email fails
  }
}
