import { parseJsonEffect, runApiEffect } from "@/lib/effect";
import { contactFormSchema } from "@/lib/domain/forms";
import { sendContactMessageEffect } from "@/lib/services/contact.server";
import { withStrictRateLimit } from "@/lib/with-rate-limit";
import { Effect } from "effect";
import type { NextRequest } from "next/server";
import type { z } from "zod";

type ContactMessageInput = z.input<typeof contactFormSchema>;

async function handleContact(req: NextRequest) {
  return runApiEffect(
    Effect.gen(function* () {
      const body = yield* parseJsonEffect<ContactMessageInput>(req);
      return yield* sendContactMessageEffect(body);
    }),
  );
}

export const POST = withStrictRateLimit(handleContact);
