type LoyaltySearchArgs = {
  clerkUserId: string;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
};

type LoyaltySearchRecord = LoyaltySearchArgs & {
  searchText?: string | null;
};

function normalizeField(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildLoyaltySearchFields(args: LoyaltySearchArgs) {
  const userName = normalizeField(args.userName);
  const userEmail = normalizeField(args.userEmail);
  const userPhone = normalizeField(args.userPhone);
  const searchText = [
    args.clerkUserId.trim().toLowerCase(),
    userName?.toLowerCase(),
    userEmail?.toLowerCase(),
    userPhone?.toLowerCase(),
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return {
    userName,
    userEmail,
    userPhone,
    searchText: searchText || undefined,
  };
}

export function loyaltySearchMatches(
  row: LoyaltySearchRecord,
  rawSearch?: string | null,
) {
  const search = rawSearch?.trim().toLowerCase();
  if (!search) {
    return true;
  }

  const haystack =
    row.searchText ??
    buildLoyaltySearchFields({
      clerkUserId: row.clerkUserId,
      userName: row.userName,
      userEmail: row.userEmail,
      userPhone: row.userPhone,
    }).searchText ??
    "";

  return haystack.includes(search);
}

export function loyaltySearchFieldsChanged(
  current: Partial<ReturnType<typeof buildLoyaltySearchFields>>,
  next: ReturnType<typeof buildLoyaltySearchFields>,
) {
  return (
    current.userName !== next.userName ||
    current.userEmail !== next.userEmail ||
    current.userPhone !== next.userPhone ||
    current.searchText !== next.searchText
  );
}
