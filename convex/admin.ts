import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// =============================================================================
// SECURITY: Admin-only helper with server-side role verification
// =============================================================================
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

// =============================================================================
// GST/PAN VALIDATION
// =============================================================================
function validateGST(gst: string): boolean {
  // GST format: 15 characters, alphanumeric
  // Format: 2 digit state code + 10 char PAN + 1 digit entity number + Z default + check digit
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

function validatePAN(pan: string): boolean {
  // PAN format: 10 characters
  // Format: AAAAA1234F (5 letters + 4 digits + 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

// =============================================================================
// AUDIT LOG HELPER
// =============================================================================
async function logAuditEvent(
  ctx: any,
  action: string,
  targetUserId: Id<"users">,
  adminUserId: Id<"users">
) {
  await ctx.db.insert("auditLogs", {
    action,
    target_user_id: targetUserId,
    admin_user_id: adminUserId,
    timestamp: Date.now(),
  });
}

// =============================================================================
// QUERIES
// =============================================================================

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

        const venues = await ctx.db
          .query("venues")
          .withIndex("by_owner_id", (q: any) => q.eq("owner_id", owner._id))
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
          venues: venues.map((v: any) => ({
            id: v._id,
            name: v.name,
            status: v.status,
            price_per_hour: v.price_per_hour,
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

    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(limit);

    return logs;
  },
});

// =============================================================================
// MUTATIONS
// =============================================================================

export const approveOwner = mutation({
  args: {
    userId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const targetUserId = args.userId as Id<"users">;

    const targetUser = await ctx.db.get(targetUserId);
    if (!targetUser) {
      throw new Error("User not found");
    }
    if (targetUser.role !== "owner") {
      throw new Error("User is not an owner");
    }

    // Validate GST/PAN if present in owner profile
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

    // Approve user
    await ctx.db.patch(targetUserId, {
      is_approved: true,
      approved_at: Date.now(),
      updated_at: new Date().toISOString(),
    });

    // Approve all pending venues for this owner
    const venues = await ctx.db
      .query("venues")
      .withIndex("by_owner_id", (q: any) => q.eq("owner_id", targetUserId))
      .collect();

    for (const venue of venues) {
      if (venue.status === "pending") {
        await ctx.db.patch(venue._id, {
          status: "approved",
          approved_at: Date.now(),
          approved_by: admin._id,
        });
      }
    }

    // Create notification
    await ctx.db.insert("notifications", {
      user_id: targetUserId,
      title: "Account Approved",
      body: "Your owner account has been approved. You can now manage your venues.",
      type: "owner_approved",
      is_read: false,
    });

    // Audit log
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
    const targetUserId = args.userId as Id<"users">;

    const targetUser = await ctx.db.get(targetUserId);
    if (!targetUser) {
      throw new Error("User not found");
    }
    if (targetUser.role !== "owner") {
      throw new Error("User is not an owner");
    }

    // Reject user
    await ctx.db.patch(targetUserId, {
      is_approved: false,
      updated_at: new Date().toISOString(),
    });

    // Reject all pending venues
    const venues = await ctx.db
      .query("venues")
      .withIndex("by_owner_id", (q: any) => q.eq("owner_id", targetUserId))
      .collect();

    for (const venue of venues) {
      if (venue.status === "pending") {
        await ctx.db.patch(venue._id, {
          status: "rejected",
          approved_at: Date.now(),
          approved_by: admin._id,
        });
      }
    }

    // Create notification with rejection reason
    await ctx.db.insert("notifications", {
      user_id: targetUserId,
      title: "Account Rejected",
      body: `Your owner account has been rejected. Reason: ${args.reason}`,
      type: "owner_rejected",
      data: { reason: args.reason },
      is_read: false,
    });

    // Audit log
    await logAuditEvent(ctx, "reject_owner", targetUserId, admin._id);

    return { success: true };
  },
});

export const approveVenue = mutation({
  args: {
    venueId: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const venueId = args.venueId as Id<"venues">;

    const venue = await ctx.db.get(venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    // Verify the owner is approved
    const owner = await ctx.db.get(venue.owner_id);
    if (!owner || !owner.is_approved) {
      throw new Error("Owner must be approved before venue can be activated");
    }

    await ctx.db.patch(venueId, {
      status: "active",
      approved_at: Date.now(),
      approved_by: admin._id,
    });

    // Notify owner
    await ctx.db.insert("notifications", {
      user_id: venue.owner_id,
      title: "Venue Approved",
      body: `Your venue "${venue.name}" has been approved and is now live.`,
      type: "venue_approved",
      is_read: false,
    });

    await logAuditEvent(ctx, "approve_venue", venue.owner_id, admin._id);

    return { success: true };
  },
});

export const rejectVenue = mutation({
  args: {
    venueId: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const venueId = args.venueId as Id<"venues">;

    const venue = await ctx.db.get(venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    await ctx.db.patch(venueId, {
      status: "rejected",
      approved_at: Date.now(),
      approved_by: admin._id,
    });

    // Notify owner
    await ctx.db.insert("notifications", {
      user_id: venue.owner_id,
      title: "Venue Rejected",
      body: `Your venue "${venue.name}" has been rejected. Reason: ${args.reason}`,
      type: "venue_rejected",
      data: { reason: args.reason },
      is_read: false,
    });

    await logAuditEvent(ctx, "reject_venue", venue.owner_id, admin._id);

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
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Prevent self-demotion
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

// =============================================================================
// ONE-TIME ADMIN SETUP
// This mutation can only be used ONCE - when no admin exists in the system.
// After the first admin is created, this mutation will permanently fail.
// =============================================================================

export const setupFirstAdmin = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if ANY admin already exists
    const existingAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .take(1);

    if (existingAdmins.length > 0) {
      throw new Error(
        "Admin already exists. This setup can only be used once. " +
        "Please contact the existing admin for access."
      );
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebase_uid", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found. Please sign up first.");
    }

    // Promote to admin
    await ctx.db.patch(user._id, {
      role: "admin",
      is_approved: true,
      updated_at: new Date().toISOString(),
    });

    // Create notification
    await ctx.db.insert("notifications", {
      user_id: user._id,
      title: "Admin Account Created",
      body: "You are now the first admin of Turfzo. You can access the admin dashboard at /admin.",
      type: "admin_setup",
      is_read: false,
    });

    // Audit log
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

// =============================================================================
// CHECK IF ADMIN EXISTS (for setup page)
// =============================================================================

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
