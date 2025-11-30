/**
 * Admin Validator
 * Zod validation schemas for admin-only operations
 */

const { z } = require('zod');

/**
 * Generic validation middleware for complex requests
 * Supports validation of body, query, and params
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace req properties with validated/transformed data
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
};

/**
 * Schema for updating user role
 * PATCH /api/admin/users/:id/role
 */
const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(['user', 'admin'], {
      errorMap: () => ({ message: 'Role must be "user" or "admin"' }),
    }),
  }),
});

/**
 * Schema for listing users with filters
 * GET /api/admin/users
 */
const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    role: z.enum(['user', 'admin']).optional(),
    sortBy: z.enum(['createdAt', 'name', 'email', 'updatedAt']).default('createdAt'),
    order: z.enum(['ASC', 'DESC']).default('DESC'),
  }),
});

module.exports = {
  validate,
  updateRoleSchema,
  listUsersSchema,
};
