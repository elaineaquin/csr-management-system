import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const permissionStatement = {
  dashboard: ["view"],
  proposal: [
    "create",
    "revise",
    "update",
    "delete",
    "view",
    "approve",
    "reject",
    "request-revision",
    "complete",
  ],
  fundRequest: [
    "create",
    "delete",
    "update",
    "view",
    "approve",
    "reject",
    "disburse",
  ],
  document: ["create", "view", "update", "delete", "share", "archive"],
  adminPanel: ["view"],
  report: ["view"],
  approvalAndComs: ["view"],
  volunteer: ["view", "create", "participate", "approve", "reject", "close"],
} as const;

export type PermissionGroup = keyof typeof permissionStatement;
export type PermissionActions = {
  [Key in PermissionGroup]: (typeof permissionStatement)[Key][number];
};
export type PermissionRequest = {
  [Key in PermissionGroup]?: (typeof permissionStatement)[Key][number][];
};

const statement = {
  ...defaultStatements,
  ...permissionStatement,
} as const;

export const ac = createAccessControl(statement);

// custom roles
// u1: CSR Points of Contact (POCs)
// u2: Leadership & Approvers (Sustainability Director, CEO, Executives)
// u3: Finance & Procurement Team
// u4: Partner Organizations
// u5: Volunteers
const generateRoles = () => {
  return {
    user: ac.newRole({
      dashboard: ["view"],
    }),
    admin: ac.newRole({
      adminPanel: ["view"],
      ...adminAc.statements,
    }),
    u1: ac.newRole({
      proposal: ["create", "revise", "update", "view", "complete"],
      fundRequest: ["create", "delete", "update", "view"],
      document: ["create", "view", "update", "delete", "share", "archive"],
      approvalAndComs: ["view"],
      volunteer: ["approve", "reject"],
      report: ["view"],
    }),
    u2: ac.newRole({
      proposal: ["approve", "reject", "request-revision", "view"],
      document: ["view", "create"],
      fundRequest: ["view", "approve", "reject", "disburse"],
      approvalAndComs: ["view"],
      volunteer: ["approve", "reject"],
      report: ["view"],
    }),
    u3: ac.newRole({
      fundRequest: [
        "create",
        "delete",
        "update",
        "view",
        "approve",
        "reject",
        "disburse",
      ],
      document: ["view", "create"],
      approvalAndComs: ["view"],
      report: ["view"],
    }),
    u4: ac.newRole({
      proposal: ["create", "revise", "update", "view", "complete"],
      document: ["view", "create"],
      approvalAndComs: ["view"],
      volunteer: ["approve", "reject"],
      report: ["view"],
    }),
    u5: ac.newRole({
      volunteer: ["view", "participate"],
      document: ["view"],
    }),
  };
};

export const roles = generateRoles();
export type RoleKey = keyof typeof roles;
