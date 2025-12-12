# Nested Categories Implementation (2-Level)

## Current State
Project uses flat categories (no nesting). Schema: `id`, `name`, `slug`, `created_at`, `updated_at`. No parent tracking.

## Database Design

### Schema Pattern: Adjacency List (Parent_ID)
**Best for 2-level**, simplest migration path.

```sql
ALTER TABLE categories ADD COLUMN parent_id INT DEFAULT NULL;
ALTER TABLE categories ADD FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE categories ADD INDEX idx_parent_id (parent_id);
```

### Schema Fields
- `id`: PRIMARY KEY, AUTO_INCREMENT
- `name`: VARCHAR(100), NOT NULL, UNIQUE
- `slug`: VARCHAR(100), NOT NULL, UNIQUE
- `parent_id`: INT, NULLABLE (NULL = root category, parent_id = category ID)
- `created_at`, `updated_at`: TIMESTAMPS

### Why Adjacency List?
- ✅ Simple queries: `WHERE parent_id = X`
- ✅ Easy migration from flat structure
- ✅ Inserts/updates fast
- ✅ Perfect for 2-level max depth
- ⚠️ Recursive queries needed for deep traversal (not issue at 2 levels)

### Alternative: Nested Set (path field)
Store full path like `1/5/12/`. Faster reads, slower writes. Skip for 2-level (overkill).

---

## Backend Patterns (Sequelize)

### Self-Referencing Association
```javascript
// Category.js
Category.hasMany(Category, {
  as: 'children',
  foreignKey: 'parent_id',
  useJunctionTable: false,
});

Category.belongsTo(Category, {
  as: 'parent',
  foreignKey: 'parent_id',
});
```

### Query Examples

**Get all root categories with children:**
```javascript
Category.findAll({
  where: { parent_id: null },
  include: [{ association: 'children', attributes: ['id', 'name', 'slug'] }],
  order: [['name', 'ASC'], [{ association: 'children' }, 'name', 'ASC']],
});
```

**Get category with parent:**
```javascript
Category.findByPk(id, {
  include: [{ association: 'parent', attributes: ['id', 'name'] }],
});
```

**Get all descendants (tree structure):**
```javascript
// For 2-level, just fetch root + children separately in service layer
const roots = await Category.findAll({ where: { parent_id: null }, ... });
const allWithChildren = await Promise.all(
  roots.map(root => root.getChildren())
);
```

### Prevent Circular References

**Application-level validation (Sequelize hook):**
```javascript
Category.beforeSave(async (category) => {
  if (!category.parent_id) return; // Root category, OK

  // Check if parent is descendant of this category
  const parent = await Category.findByPk(category.parent_id);
  if (!parent) throw new Error('Parent category not found');

  if (parent.parent_id === category.id) {
    throw new Error('Circular reference detected');
  }
});
```

**Database-level (trigger in MySQL):**
```sql
CREATE TRIGGER prevent_circular_category
BEFORE UPDATE ON categories
FOR EACH ROW
BEGIN
  IF NEW.parent_id = NEW.id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Circular reference not allowed';
  END IF;
END;
```

---

## Frontend UI

### Lightweight Options
1. **react-expandable-treeview** - Simple, fully customizable, minimal deps
2. **react-accessible-treeview** - WAI-ARIA compliant, better a11y
3. **MUI X TreeView** - Enterprise, if already using Material-UI

### Breadcrumb Navigation
```jsx
// Show: Home > Travel > Destinations
const Breadcrumb = ({ categoryId, categories }) => {
  const buildPath = (catId, acc = []) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return acc;
    return buildPath(cat.parent_id, [cat, ...acc]);
  };

  const path = buildPath(categoryId);
  return <nav>{path.map((cat, i) => /* render */)}</nav>;
};
```

### Simple Tree Expand/Collapse
```jsx
const [expanded, setExpanded] = useState({});

const toggleCategory = (id) => {
  setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
};

const renderTree = (categories) => (
  <ul>
    {categories
      .filter(cat => !cat.parent_id)
      .map(root => (
        <li key={root.id}>
          <button onClick={() => toggleCategory(root.id)}>
            {expanded[root.id] ? '▼' : '▶'} {root.name}
          </button>
          {expanded[root.id] && (
            <ul>
              {categories
                .filter(cat => cat.parent_id === root.id)
                .map(child => (
                  <li key={child.id}>{child.name}</li>
                ))}
            </ul>
          )}
        </li>
      ))}
  </ul>
);
```

---

## Migration Strategy (Existing Data)

### Step 1: Add parent_id Column
```javascript
// migration: 20251201-add-parent-id-to-categories.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('categories', 'parent_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addConstraint('categories', {
      fields: ['parent_id'],
      type: 'foreign key',
      references: { table: 'categories', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addIndex('categories', ['parent_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('categories', 'categories_parent_id_fk');
    await queryInterface.removeColumn('categories', 'parent_id');
  },
};
```

### Step 2: Seed Subcategories (Optional)
If migrating from single-level, use seeder to create subcategories:
```javascript
// seeders/20251201-seed-subcategories.js
module.exports = {
  up: async (queryInterface) => {
    // Example: Create subcategory under "Travel" root category
    await queryInterface.bulkUpdate('categories',
      { parent_id: 1 }, // Travel (ID 1) now parent
      { name: { [Op.in]: ['Beaches', 'Mountains'] } }
    );
  },
};
```

### Step 3: Verify Data Integrity
```sql
-- Check for orphaned categories (optional, shouldn't happen with FK)
SELECT * FROM categories WHERE parent_id NOT IN (SELECT id FROM categories) AND parent_id IS NOT NULL;
```

---

## Performance Optimization

### Sequelize Query Tips
1. **Eager load with `include`:**
   ```javascript
   Category.findAll({
     include: [{ association: 'children' }],
   });
   ```

2. **Limit attributes returned:**
   ```javascript
   Category.findAll({
     attributes: ['id', 'name', 'slug', 'parent_id'],
   });
   ```

3. **Use `separate: true` for many-to-many:**
   ```javascript
   Category.findAll({
     include: [{ association: 'articles', separate: true }],
   });
   ```

4. **Index on parent_id** (already in migration above)

### Caching Strategy
For frequently accessed category tree (read-heavy):
```javascript
const CATEGORY_CACHE_KEY = 'categories:tree';
const CACHE_TTL = 3600; // 1 hour

async function getCategoryTree() {
  const cached = await redis.get(CATEGORY_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const tree = await Category.findAll({ include: ['children'] });
  await redis.setex(CATEGORY_CACHE_KEY, CACHE_TTL, JSON.stringify(tree));
  return tree;
}

// Invalidate on create/update/delete
Category.afterCreate(() => redis.del(CATEGORY_CACHE_KEY));
```

---

## Best Practices

### Max Depth Limit
**Enforce 2-level maximum:**
```javascript
Category.beforeValidate(async (category) => {
  if (!category.parent_id) return; // Root OK

  const parent = await Category.findByPk(category.parent_id);
  if (parent.parent_id) {
    throw new Error('Categories limited to 2 levels');
  }
});
```

### Orphan Handling
- **Option 1**: Cascade delete (recommended for simple case)
  ```sql
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
  ```
- **Option 2**: Move to root on parent delete
  ```sql
  ON DELETE SET NULL
  ```

### Delete Protection
Prevent accidental deletion of parent categories:
```javascript
async deleteCategory(categoryId) {
  const childCount = await Category.count({ where: { parent_id: categoryId } });
  if (childCount > 0) {
    throw new Error(`Cannot delete: has ${childCount} subcategories`);
  }
  await Category.destroy({ where: { id: categoryId } });
}
```

### Breadcrumb Generation (Backend)
```javascript
async getBreadcrumb(categoryId) {
  const path = [];
  let current = await Category.findByPk(categoryId);

  while (current) {
    path.unshift({ id: current.id, name: current.name, slug: current.slug });
    current = current.parent_id
      ? await Category.findByPk(current.parent_id)
      : null;
  }

  return path;
}
```

---

## Implementation Checklist

- [ ] Create migration: add `parent_id` column
- [ ] Update Category model with self-referencing associations
- [ ] Add circular reference validation (beforeValidate hook)
- [ ] Update categoryController with new methods:
  - `getTree()` - Get root + children structure
  - `getWithParent()` - Get category with parent info
  - `getBreadcrumb()` - Get path to root
- [ ] Add endpoint: `GET /api/categories/tree` (tree structure)
- [ ] Add endpoint: `POST /api/categories` with optional `parent_id`
- [ ] Frontend: Install tree UI component
- [ ] Add breadcrumb navigation to article detail page
- [ ] Test: Circular reference prevention
- [ ] Test: Delete parent with children (should fail)
- [ ] Performance test: Tree query with 100+ categories

---

## Unresolved Questions

1. Should category selection on articles be flat dropdown or tree selector?
2. Need caching strategy defined if category tree accessed frequently (>1000 times/day)?
3. Should admin be able to reorganize tree (drag-drop), or just create at seed time?
