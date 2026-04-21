# Apps/api/modules Module

## Files (39)
- apps/api/src/modules/admin/admin.controller.ts
- apps/api/src/modules/admin/admin.module.ts
- apps/api/src/modules/admin/admin.service.ts
- apps/api/src/modules/auth/auth.controller.ts
- apps/api/src/modules/auth/auth.module.ts
- apps/api/src/modules/auth/auth.service.ts
- apps/api/src/modules/auth/jwt.strategy.ts
- apps/api/src/modules/contact/contact.controller.ts
- apps/api/src/modules/contact/contact.module.ts
- apps/api/src/modules/contact/contact.service.ts
- apps/api/src/modules/page/page.controller.ts
- apps/api/src/modules/page/page.dto.ts
- apps/api/src/modules/page/page.module.ts
- apps/api/src/modules/page/page.service.ts
- apps/api/src/modules/plan/plan.controller.ts
- apps/api/src/modules/plan/plan.module.ts
- apps/api/src/modules/plan/plan.service.ts
- apps/api/src/modules/property/property.controller.ts
- apps/api/src/modules/property/property.module.ts
- apps/api/src/modules/property/property.service.ts
- apps/api/src/modules/lead/lead.controller.ts
- apps/api/src/modules/lead/lead.module.ts
- apps/api/src/modules/lead/lead.service.ts
- apps/api/src/modules/public/public.controller.ts
- apps/api/src/modules/public/public.module.ts
- apps/api/src/modules/public/public.service.ts
- apps/api/src/modules/tenant/tenant.controller.ts
- apps/api/src/modules/tenant/tenant.module.ts
- apps/api/src/modules/tenant/tenant.service.ts
- apps/api/src/modules/upload/upload.controller.ts
- apps/api/src/modules/upload/upload.module.ts
- apps/api/src/modules/upload/upload.service.ts
- apps/api/src/modules/subscription/subscription.controller.ts
- apps/api/src/modules/subscription/subscription.module.ts
- apps/api/src/modules/subscription/subscription.service.ts
- apps/api/src/modules/subscription/tiktok-events.service.ts
- apps/api/src/modules/user/user.controller.ts
- apps/api/src/modules/user/user.module.ts
- apps/api/src/modules/user/user.service.ts

## Exports

### Classes
- `class AdminController { validateAdminKey(authorization: string); dashboard(auth: string); listTenants(auth: string); plans(auth: string); setTenantPlan(auth: string, tenantId: string, body: { planId: string; subscriptionStatus: string; }) }`
- `class AdminModule`
- `class AdminService { getDashboardStats(); listTenants(); getPlans(); setTenantPlan(tenantId: string, planId: string, subscriptionStatus: string) }`
- `class AuthController { register(body: { name: string; email: string; password: string; phone?: string | undefined; agencyName: string; }); login(body: { email: string; password: string; tenantId?: string | undefined; }); refresh(body: { refreshToken: string; }); switchTenant(email: string, twoFactorVerified: boolean, body: { tenantId: string; }); verifyTwoFactor(userId: string, email: string, tenantId: string, role: string, body: { code: string; }); resendTwoFactor(userId: string); listTenants(email: string); createTenant(userId: string, body: { agencyName: string; }) }`
- `class AuthModule`
- `class AuthService { register(dto: RegisterDto); login(email: string, password: string, tenantId: string | undefined); switchTenant(email: string, tenantId: string, twoFactorVerified: boolean); listTenants(email: string); createTenant(userId: string, agencyName: string); refresh(refreshToken: string); me(userId: string); forgotPassword(email: string) }`
- `class JwtStrategy { validate(payload: any) }`
- `class ContactController { get(tenantId: string); update(tenantId: string, body: any) }`
- `class ContactModule`
- `class ContactService { findByTenant(tenantId: string); upsert(tenantId: string, data: any) }`
- `class PageController { list(tenantId: string); create(tenantId: string, dto: CreatePageDto); get(tenantId: string, id: string); update(tenantId: string, id: string, dto: UpdatePageDto); remove(tenantId: string, id: string); publish(tenantId: string, id: string); resetTemplate(tenantId: string, id: string) }`
- `class CreatePageDto`
- `class UpdatePageDto`
- `class PageModule`
- `class PageService { ensureDefaults(tenantId: string); list(tenantId: string); get(tenantId: string, id: string); create(tenantId: string, dto: CreatePageDto); update(tenantId: string, id: string, dto: UpdatePageDto); syncSharedChromeToOtherReservedPages(tenantId: string, sourceSlug: "search" | "home" | "property", chrome: { navbar?: unknown; footer?: unknown; }); remove(tenantId: string, id: string); resetToTemplate(tenantId: string, id: string) }`
- `class PlanController { list() }`
- `class PlanModule`
- `class PlanService { findAll() }`
- `class PropertyController { list(tenantId: string); findOne(tenantId: string, id: string); create(tenantId: string, body: any); generateSeo(tenantId: string, body: any); update(tenantId: string, id: string, body: any); remove(tenantId: string, id: string) }`
- `class PropertyModule`
- `class PropertyService { findAll(tenantId: string); findById(tenantId: string, id: string); create(tenantId: string, data: any); update(tenantId: string, id: string, data: any); remove(tenantId: string, id: string); generateSeo(data: any) }`
- `class LeadController { list(tenantId: string, query: any); markAllSeen(tenantId: string); markSeen(tenantId: string, id: string); remove(tenantId: string, id: string) }`
- `class LeadModule`
- `class LeadService { findAll(tenantId: string, query: any); markSeen(tenantId: string, id: string); markAllSeen(tenantId: string); remove(tenantId: string, id: string) }`
- `class PublicController { googleReviews(placeId: string, minRating: string | undefined); resolveDomain(domain: string); tenant(slug: string); filterOptions(slug: string, city: string | undefined); listProperties(slug: string, query: any); findProperty(slug: string, propertySlug: string); listPages(slug: string); getPage(slug: string, pageSlug: string) }`
- `class PublicModule { configure(consumer: MiddlewareConsumer) }`
- `class PublicService { getBaseUrl(slug: string, customDomain: string | null | undefined); findTenant(slug: string); getFilterOptions(slug: string, city: string | undefined); listProperties(slug: string, query: any); findProperty(slug: string, propertySlug: string); getGoogleReviews(placeId: string, minRating: number); resolveDomain(domain: string); getPage(slug: string, pageSlug: string) }`
- `class TenantController { get(tenantId: string); dashboard(tenantId: string); update(tenantId: string, body: any); checkSlug(tenantId: string, slug: string); updateSlug(tenantId: string, body: { slug: string; }); updateDomain(tenantId: string, body: { domain: string | null; }); verifyDomain(tenantId: string) }`
- `class TenantModule`
- `class TenantService { findById(id: string); getDashboardStats(tenantId: string); findBySlug(slug: string); update(id: string, data: any); checkSlugAvailability(slug: string, currentTenantId: string); updateSlug(tenantId: string, slug: string); updateCustomDomain(tenantId: string, domain: string | null); verifyDomain(tenantId: string) }`
- `class UploadController { getPresignedUrl(body: { filename: string; contentType: string; folder?: string | undefined; }); deleteFile(body: { url: string; }); serveFile(folder: string, filename: string, res: Response<any, Record<string, any>>) }`
- `class UploadModule`
- `class UploadService { getS3(); getBucket(); generatePresignedUrl(filename: string, contentType: string, folder: string); getFile(key: string); extractKey(url: string); deleteFile(url: string); deleteFiles(urls: string[]) }`
- `class SubscriptionController { getInfo(tenantId: string); createCheckout(tenantId: string, body: { planId: string; billing?: "monthly" | "yearly" | undefined; }); billingPortal(tenantId: string); cancellationSummary(tenantId: string); cancel(tenantId: string, userId: string, body: { reason: string; comment?: string | undefined; }); webhook(req: RawBodyRequest<Request<ParamsDictionary, any, any, qs.ParsedQs, Record<string, any>>>, signature: string) }`
- `class SubscriptionModule`
- `class SubscriptionService { getStripe(); getSubscriptionInfo(tenantId: string); getPlanChangeStatus(tenant: { stripeSubscriptionId: string | null; subscriptionStatus: string; planChangedAt: Date | null; }); createCheckoutSession(tenantId: string, planId: string, billing: "monthly" | "yearly"); createPortalSession(tenantId: string); cancelSubscription(tenantId: string, userId: string, reason: string, comment: string | undefined); getCancellationSummary(tenantId: string); handleWebhook(payload: Buffer<ArrayBufferLike>, signature: string) }`
- `class TikTokEventsService { sha256(value: string); sendEvent(eventName: string, user: UserData, properties: EventProperties, eventId: string | undefined) }`
- `class UserController { list(tenantId: string); create(tenantId: string, body: any); update(tenantId: string, id: string, body: any); remove(tenantId: string, id: string) }`
- `class UserModule`
- `class UserService { findAll(tenantId: string); create(tenantId: string, data: { email: string; password: string; name: string; phone?: string | undefined; role?: string | unde...); update(tenantId: string, id: string, data: { name?: string | undefined; phone?: string | undefined; role?: string | undefined; password?: st...); remove(tenantId: string, id: string) }`

## Internal dependencies
- → apps/api/prisma
- → apps/api/common

## External dependencies
`@nestjs/common`, `@nestjs/config`, `@nestjs/throttler`, `@nestjs/jwt`, `@nestjs/passport`, `resend`, `bcryptjs`, `@imovdigital/utils`, `passport-jwt`, `class-validator`, `crypto`, `@imovdigital/types`, `@anthropic-ai/sdk`, `express`, `dns`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `stream`, `stripe`

---
_Auto-generated by code-memory_
