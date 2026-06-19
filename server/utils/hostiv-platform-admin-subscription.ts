import type { HostivSubscriptionAccess } from "../../app/utils/hostiv-subscription-access"
import {
  buildHostivPlatformAdminSubscriptionAccess,
  buildHostivSubscriptionAccess
} from "../../app/utils/hostiv-subscription-access"
import { isPlatformAdminEmail } from "./platform-admin-auth"
import { getUserEmailById } from "./transactional-email"

export type HostivAccountSubscriptionInput = {
  subscription_plan?: string | null
  paid_until?: string | null
  subscription_started_at?: string | null
  premium_tools_until?: string | null
  premium_tools_started_at?: string | null
}

export function buildHostivSubscriptionAccessForEmail(
  account: HostivAccountSubscriptionInput | null | undefined,
  email: string | null | undefined
): HostivSubscriptionAccess {
  if (isPlatformAdminEmail(email)) {
    return buildHostivPlatformAdminSubscriptionAccess(account?.subscription_started_at)
  }

  return buildHostivSubscriptionAccess({
    subscription_plan: account?.subscription_plan,
    paid_until: account?.paid_until,
    subscription_started_at: account?.subscription_started_at,
    premium_tools_until: account?.premium_tools_until,
    premium_tools_started_at: account?.premium_tools_started_at
  })
}

export async function buildHostivSubscriptionAccessForOwner(
  ownerUserId: string,
  account: HostivAccountSubscriptionInput | null | undefined
): Promise<HostivSubscriptionAccess> {
  const email = await getUserEmailById(ownerUserId)

  return buildHostivSubscriptionAccessForEmail(account, email)
}

export async function isHostivPlatformAdminOwner(ownerUserId: string): Promise<boolean> {
  const email = await getUserEmailById(ownerUserId)

  return isPlatformAdminEmail(email)
}
