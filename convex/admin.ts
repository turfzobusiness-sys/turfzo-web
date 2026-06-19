import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_firebase_uid", (q: any) => q.eq("firebase_uid", identity.subject))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

function validateGST(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

function validatePAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

async function logAuditEvent(
  ctx: any,
  action: string,
  targetUserId: string,
  adminUserId: string
) {
  await ctx.db.insert("auditLogs", {
    action,
    target_user_id: targetUserId,
    admin_user_id: adminUserId,
    timestamp: Date.now(),
  });
}

export const listPendingOwners = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const owners = await ctx.db
      .query("users")
      .withIndex("by_role", (q: any) => q.eq("role", "owner"))
      .collect();

    const pendingOwners = owners.filter((u: any) => !u.is_approved);

    const results = await Promise.all(
      pendingOwners.map(async (owner: any) => {
        const profile = await ctx.db
          .query("ownerProfiles")
          .withIndex("by_user_id", (q: any) => q.eq("user_id", owner._id))
          .unique();

        const turfs = await ctx.db
          .query("turfs")
          .withIndex("by_user_id", (q: any) => q.eq("user_id", owner._id))
          .collect();

        return {
          id: owner._id,
          email: owner.email,
          full_name: owner.full_name,
          display_name: owner.display_name,
          phone_number: owner.phone_number,
          city: owner.city,
          created_at: owner.created_at,
          profile: profile
            ? {
                business_name: profile.business_name,
                gst_number: profile.gst_number,
                pan_number: profile.pan_number,
                onboarding_completed: profile.onboarding_completed,
              }
            : null,
          turfs: turfs.map((t: any) => ({
            id: t._id,
            name: t.name,
            status: t.status,
            price_per_hour: t.price_per_hour,
          })),
        };
      })
    );

    return results;
  },
});

export const listAllUsers = query({
  args: {
    role: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let users = await ctx.db.query("users").collect();

    if (args.role) {
      users = users.filter((u) => u.role === args.role);
    }

    if (args.search) {
      const search = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          (u.full_name && u.full_name.toLowerCase().includes(search)) ||
          (u.display_name && u.display_name.toLowerCase().includes(search))
      );
    }

    return users.map((u) => ({
      id: u._id,
      email: u.email,
      full_name: u.full_name,
      display_name: u.display_name,
      role: u.role,
      is_approved: u.is_approved,
      city: u.city,
      created_at: u.created_at,
    }));
  },
});

export const listContactMessages = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("contactSubmissions").collect();
  },
});

export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 100, 500);
    return await ctx.db.query("auditLogs").order("desc").take(limit);
  },
});

export const approveOwner = mutation({
  args: {
    userId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const targetUserId = args.userId;

    const targetUser = await ctx.db.get(targetUserId as Id<"users">);
    if (!targetUser) throw new Error("User not found");
    if (targetUser.role !== "owner") throw new Error("User is not an owner");

    const profile = await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q: any) => q.eq("user_id", targetUserId))
      .unique();

    if (profile) {
      if (profile.gst_number && !validateGST(profile.gst_number)) {
        throw new Error("Invalid GST number format");
      }
      if (profile.pan_number && !validatePAN(profile.pan_number)) {
        throw new Error("Invalid PAN number format");
      }
    }

    const now = new Date().toISOString();

    await ctx.db.patch(targetUserId as Id<"users">, {
      is_approved: true,
      approved_at: Date.now(),
      updated_at: now,
    });

    const turfs = await ctx.db
      .query("turfs")
      .withIndex("by_user_id", (q: any) => q.eq("user_id", targetUserId))
      .collect();

    for (const turf of turfs) {
      if (turf.status === "pending") {
        await ctx.db.patch(turf._id, {
          status: "approved",
          approved_at: Date.now(),
          approved_by: admin._id,
        });
      }
    }

    await ctx.db.insert("notifications", {
      user_id: targetUserId,
      title: "Account Approved",
      body: "Your owner account has been approved. You can now manage your turfs.",
      type: "owner_approved",
      is_read: false,
      created_at: now,
    });

    await logAuditEvent(ctx, "approve_owner", targetUserId, admin._id);

    return { success: true };
  },
});

export const rejectOwner = mutation({
  args: {
    userId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const targetUserId = args.userId;

    const targetUser = await ctx.db.get(targetUserId as Id<"users">);
    if (!targetUser) throw new Error("User not found");
    if (targetUser.role !== "owner") throw new Error("User is not an owner");

    const now = new Date().toISOString();

    await ctx.db.patch(targetUserId as Id<"users">, {
      is_approved: false,
      updated_at: now,
    });

    const turfs = await ctx.db
      .query("turfs")
      .withIndex("by_user_id", (q: any) => q.eq("user_id", targetUserId))
      .collect();

    for (const turf of turfs) {
      if (turf.status === "pending") {
        await ctx.db.patch(turf._id, {
          status: "rejected",
        });
      }
    }

    await ctx.db.insert("notifications", {
      user_id: targetUserId,
      title: "Account Rejected",
      body: `Your owner account has been rejected. Reason: ${args.reason}`,
      type: "owner_rejected",
      data: { reason: args.reason },
      is_read: false,
      created_at: now,
    });

    await logAuditEvent(ctx, "reject_owner", targetUserId, admin._id);

    return { success: true };
  },
});

export const approveTurf = mutation({
  args: {
    turfId: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const turfId = args.turfId as Id<"turfs">;

    const turf = await ctx.db.get(turfId);
    if (!turf) throw new Error("Turf not found");

    const owner = await ctx.db.get(turf.user_id as Id<"users">);
    if (!owner || !owner.is_approved) {
      throw new Error("Owner must be approved before turf can be activated");
    }

    await ctx.db.patch(turfId, {
      status: "active",
      approved_at: Date.now(),
      approved_by: admin._id,
    });

    await ctx.db.insert("notifications", {
      user_id: turf.user_id,
      title: "Turf Approved",
      body: `Your turf "${turf.name}" has been approved and is now live.`,
      type: "turf_approved",
      is_read: false,
      created_at: new Date().toISOString(),
    });

    await logAuditEvent(ctx, "approve_turf", turf.user_id, admin._id);

    return { success: true };
  },
});

export const rejectTurf = mutation({
  args: {
    turfId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const turfId = args.turfId as Id<"turfs">;

    const turf = await ctx.db.get(turfId);
    if (!turf) throw new Error("Turf not found");

    await ctx.db.patch(turfId, {
      status: "rejected",
    });

    await ctx.db.insert("notifications", {
      user_id: turf.user_id,
      title: "Turf Rejected",
      body: `Your turf "${turf.name}" has been rejected. Reason: ${args.reason}`,
      type: "turf_rejected",
      data: { reason: args.reason },
      is_read: false,
      created_at: new Date().toISOString(),
    });

    await logAuditEvent(ctx, "reject_turf", turf.user_id, admin._id);

    return { success: true };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.string(),
    newRole: v.union(v.literal("player"), v.literal("owner"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const targetUserId = args.userId as Id<"users">;

    const targetUser = await ctx.db.get(targetUserId);
    if (!targetUser) throw new Error("User not found");

    if (targetUserId === admin._id && args.newRole !== "admin") {
      throw new Error("Cannot change your own admin role");
    }

    await ctx.db.patch(targetUserId, {
      role: args.newRole,
      updated_at: new Date().toISOString(),
    });

    await logAuditEvent(ctx, `change_role_to_${args.newRole}`, targetUserId, admin._id);

    return { success: true };
  },
});

export const setupFirstAdmin = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .take(1);

    if (existingAdmins.length > 0) {
      throw new Error(
        "Admin already exists. This setup can only be used once."
      );
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found. Please sign up first.");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(user._id, {
      role: "admin",
      is_approved: true,
      updated_at: now,
    });

    await ctx.db.insert("notifications", {
      user_id: user._id,
      title: "Admin Account Created",
      body: "You are now the first admin of Turfzo. You can access the admin dashboard at /admin.",
      type: "admin_setup",
      is_read: false,
      created_at: now,
    });

    await ctx.db.insert("auditLogs", {
      action: "setup_first_admin",
      target_user_id: user._id,
      admin_user_id: user._id,
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: "Admin account created successfully! You can now access /admin",
    };
  },
});

export const checkAdminExists = query({
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .take(1);

    return {
      adminExists: admins.length > 0,
      adminCount: admins.length,
    };
  },
});

export const resetSetup = mutation({
  args: {
    confirm: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirm !== "RESET_ALL_ADMINS") {
      throw new Error("Invalid confirmation. Pass confirm: 'RESET_ALL_ADMINS'");
    }

    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    for (const admin of admins) {
      await ctx.db.patch(admin._id, {
        role: "player",
        updated_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: `Reset ${admins.length} admin(s) to player role.`,
    };
  },
});
