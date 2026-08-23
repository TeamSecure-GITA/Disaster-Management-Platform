const { body } = require("express-validator");

const syncValidator = [
  body("deviceId")
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Device ID is required and must be 120 characters or fewer"),
  body("operations")
    .isArray({ min: 1, max: 50 })
    .withMessage("Operations must contain between 1 and 50 items"),
  body("operations.*.operationId")
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Each operation requires an operation ID"),
  body("operations.*.resource")
    .equals("family")
    .withMessage("Only family synchronization is supported"),
  body("operations.*.action")
    .isIn(["upsert", "add_member", "update_member", "delete_member", "update_safety"])
    .withMessage("Unsupported synchronization action"),
  body("operations.*.payload")
    .optional()
    .isObject()
    .withMessage("Operation payload must be an object"),
  body("operations.*.clientCreatedAt")
    .optional()
    .isISO8601()
    .withMessage("clientCreatedAt must be a valid ISO date"),
  body("operations").custom((operations) => {
    for (const operation of operations) {
      const payload = operation.payload || {};
      if (["update_member", "delete_member", "update_safety"].includes(operation.action) &&
          typeof payload.memberId !== "string") {
        throw new Error(`${operation.action} requires memberId`);
      }
      if (operation.action === "update_safety" && typeof payload.isSafe !== "boolean") {
        throw new Error("update_safety requires a boolean isSafe value");
      }
      if (operation.action === "add_member" && (!payload.name || !payload.relation)) {
        throw new Error("add_member requires name and relation");
      }
      if (operation.action === "update_member" &&
          (!payload.member || typeof payload.member !== "object")) {
        throw new Error("update_member requires a member object");
      }
    }
    return true;
  }),
];

module.exports = { syncValidator };