import type { EmailRepository, EmailProvider, NotificationResult, OutboundEmail, QueueEmailInput } from "./types";

export type EmailServiceDependencies = {
  emails: EmailRepository;
  provider: EmailProvider;
  /** Max send attempts before an email is left in `failed` state for manual/alerting follow-up. */
  maxAttempts?: number | undefined;
};

function failure(code: string, message: string, status: number): NotificationResult<never> {
  return { ok: false, code, message, status };
}

/**
 * Queues transactional email and processes it asynchronously so a slow or down email provider
 * never blocks the request that triggered it (order placed, password reset, etc). `processQueue`
 * is meant to be invoked by a worker/cron outside the request path.
 */
export function createEmailService(deps: EmailServiceDependencies) {
  const maxAttempts = deps.maxAttempts ?? 5;

  return {
    async queue(input: QueueEmailInput): Promise<NotificationResult<OutboundEmail>> {
      if (!input.toEmail || !input.toEmail.includes("@")) {
        return failure("INVALID_EMAIL", "A valid recipient email is required.", 422);
      }
      const email = await deps.emails.enqueue(input);
      return { ok: true, data: email };
    },

    /**
     * Claims a batch of pending emails and attempts to send each through the provider.
     * Returns per-email outcomes so a caller (worker) can log/alert on failures without one
     * failure aborting the batch.
     */
    async processQueue(batchSize = 25): Promise<{ sent: number; failed: number }> {
      const batch = await deps.emails.claimPending(batchSize);
      let sent = 0;
      let failed = 0;

      for (const email of batch) {
        try {
          const result = await deps.provider.send({
            toEmail: email.toEmail,
            subject: email.subject,
            template: email.template,
            payload: email.payload
          });
          await deps.emails.markSent(email.id, result.providerMessageId);
          sent += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown email provider error.";
          await deps.emails.markFailed(email.id, message);
          failed += 1;
          if (email.attempts + 1 >= maxAttempts) {
            // Left in `failed` status; a monitoring job / admin dashboard surfaces these for
            // manual follow-up rather than retrying indefinitely.
            continue;
          }
        }
      }

      return { sent, failed };
    }
  };
}

export type EmailService = ReturnType<typeof createEmailService>;
