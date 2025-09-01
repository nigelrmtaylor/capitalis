## Usage Examples

```sql
-- Apply tags to a stock (Apple)
SELECT apply_tags_to_thing(
    'aapl-instrument-uuid',
    ARRAY['technology', 'dividend-stock', 'favorite'],
    'user-uuid-here'
);

-- Get all tags for a thing as seen by a user
SELECT * FROM get_thing_tags_for_user('aapl-instrument-uuid', 'user-uuid-here');

-- Search things by tags (OR logic - any tag matches)
SELECT * FROM search_things_by_tags(
    ARRAY['favorite', 'high-growth'],
    'user-uuid-here',
    false -- OR logic
);

-- Search things by tags (AND logic - all tags must match)
SELECT * FROM search_things_by_tags(
    ARRAY['technology', 'dividend-stock'],
    'user-uuid-here', 
    true -- AND logic
);

-- Find user's favorite tags
SELECT t.name, pt.personal_name, pt.usage_count
FROM personal_tags pt
JOIN tags t ON pt.tag_id = t.id
WHERE pt.user_id = 'user-uuid-here' AND pt.is_favorite = true
ORDER BY pt.usage_count DESC;

-- Search for anything containing "Apple" with user's personal tags
SELECT 
    t.*,
    tt.name as entity_type,
    array_agg(DISTINCT tag.name) as tags
FROM things t
JOIN thing_types tt ON t.thing_type_id = tt.id
LEFT JOIN thing_tags ttag ON t.id = ttag.thing_id
LEFT JOIN tags tag ON ttag.tag_id = tag.id
WHERE t.owner_user_id = 'user-uuid-here'
    AND t.name ILIKE '%Apple%'
GROUP BY t.id, tt.name;

-- Point-in-time portfolio value (same as before)
SELECT 
    fh.instrument_id,
    i.name,
    fh.quantity,
    mp.price,
    (fh.quantity * mp.price) as market_value
FROM fungible_holdings fh
JOIN instruments i ON fh.instrument_id = i.id
JOIN market_prices mp ON mp.instrument_id = i.id
WHERE fh.user_id = $1
    AND fh.valid_from <= $2 AND fh.valid_to > $2  -- Point in time
    AND mp.price_date = $2;

-- Historical corrections with audit trail (same as before)
SELECT 
    transaction_time,
    valid_from,
    valid_to,
    quantity,
    'CORRECTED' as status
FROM fungible_holdings 
WHERE id = $1 
ORDER BY transaction_time;
```

## Key Benefits of This Enhanced Architecture

This data model now provides:
- ✅ **Universal Search**: Single table for all entity searches
- ✅ **UUID Resolution**: Any UUID gives complete entity context
- ✅ **Modular Licensing**: Fine-grained feature control with dependencies
- ✅ **Flexible Tagging**: Both global and personal tag systems
- ✅ **AI Integration**: Full-text and semantic search capabilities
- ✅ **Personal Organization**: User-specific tag customization and favorites
- ✅ **Automatic Sync**: Triggers keep search index current
- ✅ **Code Constraints**: Efficient 10-character codes with unlimited names
- ✅ **Notes Everywhere**: Unstructured notes on all entities
- ✅ **Temporal Support**: Full tri-temporal capabilities
- ✅ **Type Safety**: Thing types registry ensures data consistency

**Enhanced Tagging Features:**
- **Global Tags**: System-wide tags anyone can use (e.g., 'high-dividend', 'technology')
- **Personal Tags**: User-customized versions with personal names and colors
- **Smart Deduplication**: Automatic tag merging prevents duplicates
- **Usage Tracking**: Analytics on which tags are most popular
- **Flexible Search**: Search by tags with AND/OR logic
- **AI-Applied Tags**: Support for confidence scores on AI-generated tags
- **Favorites System**: Users can mark their most-used tags as favorites# Capitalis - Tri-Temporal Data Model

## Core Principles

### Temporal Dimensions
- **Valid Time**: When the fact is true in reality
- **Transaction Time**: When the fact was stored in the database
- **Decision Time**: When decisions were made based on the fact

### Asset Type Separation
- **Fungible Assets**: Quantity-based, interchangeable (shares, cash, tokens)
- **Non-Fungible Assets**: Unique, individually tracked (properties, vehicles, art)

### Universal Search Architecture
- **Base "Things" Table**: Unified searchable entity containing all database objects
- **Thing Types**: Catalog of all concrete entity types in the system
- **UUID-Based Resolution**: Single ID lookup retrieves complete entity information

## Universal Search Foundation

### 1. Module System & Licensing

```sql
-- Core modules in the system
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- 'cash_management', 'property_management', etc.
    name TEXT NOT NULL,
    description TEXT,
    version TEXT NOT NULL DEFAULT '1.0.0',
    
    -- Licensing and business model
    license_type TEXT NOT NULL CHECK (license_type IN ('free', 'basic', 'premium', 'enterprise')),
    monthly_price DECIMAL(10, 2),
    annual_price DECIMAL(10, 2),
    
    -- Module metadata
    icon TEXT, -- UI icon identifier
    color TEXT, -- UI color theme
    category TEXT, -- 'core', 'financial', 'physical_assets', 'analytics'
    sort_order INTEGER DEFAULT 100,
    
    -- Status and availability
    is_active BOOLEAN DEFAULT true,
    is_core BOOLEAN DEFAULT false, -- Core modules required for basic functionality
    min_user_tier TEXT, -- Minimum user tier required
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Module dependencies - defines which modules require others
CREATE TABLE module_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id),
    depends_on_module_id UUID NOT NULL REFERENCES modules(id),
    dependency_type TEXT NOT NULL CHECK (dependency_type IN ('required', 'optional', 'recommended')),
    min_version TEXT, -- Minimum version of dependency required
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent circular dependencies and self-references
    CHECK (module_id != depends_on_module_id)
);

-- User module licenses
CREATE TABLE user_module_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    module_id UUID NOT NULL REFERENCES modules(id),
    
    -- License details
    license_start_date DATE NOT NULL,
    license_end_date DATE, -- NULL for permanent licenses
    license_status TEXT NOT NULL CHECK (license_status IN ('active', 'suspended', 'expired', 'trial')),
    
    -- Billing information
    subscription_id TEXT, -- External billing system reference
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual', 'one_time')),
    
    -- Trial and usage tracking
    is_trial BOOLEAN DEFAULT false,
    trial_end_date DATE,
    usage_limit INTEGER, -- For usage-based licensing
    usage_count INTEGER DEFAULT 0,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert core modules
INSERT INTO modules (code, name, description, license_type, category, is_core, sort_order) VALUES
    ('core', 'Core System', 'Essential system functionality', 'free', 'core', true, 1),
    ('user_management', 'User Management', 'User profiles and authentication', 'free', 'core', true, 2),
    ('cash_management', 'Cash Management', 'Bank accounts, currencies, cash flow tracking', 'basic', 'financial', false, 10),
    ('investment_management', 'Investment Management', 'Stocks, bonds, ETFs, portfolio tracking', 'basic', 'financial', false, 20),
    ('property_management', 'Property Management', 'Real estate tracking and management', 'premium', 'physical_assets', false, 30),
    ('vehicle_management', 'Vehicle Management', 'Cars, boats, aircraft tracking', 'premium', 'physical_assets', false, 40),
    ('luxury_assets', 'Luxury Asset Management', 'Art, jewelry, collectibles', 'premium', 'physical_assets', false, 50),
    ('tax_optimization', 'Tax Optimization', 'Tax loss harvesting, reporting', 'premium', 'financial', false, 60),
    ('ai_insights', 'AI Insights & Analytics', 'Advanced AI-powered analysis', 'enterprise', 'analytics', false, 70),
    ('family_office', 'Family Office Features', 'Multi-generational wealth management', 'enterprise', 'analytics', false, 80);

-- Insert module dependencies
INSERT INTO module_dependencies (module_id, depends_on_module_id, dependency_type) VALUES
    -- Property management requires cash management (for valuations, transactions)
    ((SELECT id FROM modules WHERE code = 'property_management'), 
     (SELECT id FROM modules WHERE code = 'cash_management'), 'required'),
    
    -- Vehicle management requires cash management
    ((SELECT id FROM modules WHERE code = 'vehicle_management'), 
     (SELECT id FROM modules WHERE code = 'cash_management'), 'required'),
     
    -- Luxury assets requires cash management  
    ((SELECT id FROM modules WHERE code = 'luxury_assets'), 
     (SELECT id FROM modules WHERE code = 'cash_management'), 'required'),
    
    -- Tax optimization requires investment management
    ((SELECT id FROM modules WHERE code = 'tax_optimization'), 
     (SELECT id FROM modules WHERE code = 'investment_management'), 'required'),
    
    -- Tax optimization benefits from property management (optional)
    ((SELECT id FROM modules WHERE code = 'tax_optimization'), 
     (SELECT id FROM modules WHERE code = 'property_management'), 'optional'),
    
    -- AI insights can work with all modules (recommended)
    ((SELECT id FROM modules WHERE code = 'ai_insights'), 
     (SELECT id FROM modules WHERE code = 'investment_management'), 'recommended'),
    ((SELECT id FROM modules WHERE code = 'ai_insights'), 
     (SELECT id FROM modules WHERE code = 'property_management'), 'recommended'),
    
    -- Family office requires multiple modules
    ((SELECT id FROM modules WHERE code = 'family_office'), 
     (SELECT id FROM modules WHERE code = 'cash_management'), 'required'),
    ((SELECT id FROM modules WHERE code = 'family_office'), 
     (SELECT id FROM modules WHERE code = 'investment_management'), 'required'),
    ((SELECT id FROM modules WHERE code = 'family_office'), 
     (SELECT id FROM modules WHERE code = 'ai_insights'), 'required');
```

### 2. Thing Types Registry (Updated)

```sql
-- Registry of all entity types in the database
CREATE TABLE thing_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES module(id), -- NEW: Module association
    code TEXT NOT NULL UNIQUE, -- 'user', 'account', 'instrument', 'property', etc.
    name TEXT NOT NULL,
    description TEXT,
    table_name TEXT NOT NULL, -- Actual PostgreSQL table name
    schema_name TEXT NOT NULL DEFAULT 'public',
    is_searchable BOOLEAN DEFAULT true,
    search_weight INTEGER DEFAULT 100, -- Search ranking weight
    icon TEXT, -- UI icon identifier
    color TEXT, -- UI color theme
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert core thing types with module associations
INSERT INTO thing_type (module_id, code, name, table_name, search_weight) VALUES
    -- Core module
    ((SELECT id FROM module WHERE code = 'core'), 'user', 'User', 'user', 100),
    ((SELECT id FROM module WHERE code = 'core'), 'organization', 'Organization', 'organization', 90),
    
    -- Cash management module
    ((SELECT id FROM module WHERE code = 'cash_management'), 'currency', 'Currency', 'currency', 70),
    ((SELECT id FROM module WHERE code = 'cash_management'), 'account', 'Account', 'account', 95),
    ((SELECT id FROM module WHERE code = 'cash_management'), 'cash_transaction', 'Cash Transaction', 'cash_transaction', 75),
    
    -- Investment management module
    ((SELECT id FROM module WHERE code = 'investment_management'), 'portfolio', 'Portfolio', 'portfolio', 85),
    ((SELECT id FROM module WHERE code = 'investment_management'), 'instrument', 'Financial Instrument', 'instrument', 90),
    ((SELECT id FROM module WHERE code = 'investment_management'), 'fungible_holding', 'Investment Holding', 'fungible_holding', 80),
    ((SELECT id FROM module WHERE code = 'investment_management'), 'transaction', 'Investment Transaction', 'transaction', 75),
    
    -- Property management module
    ((SELECT id FROM module WHERE code = 'property_management'), 'property', 'Property', 'property', 85),
    ((SELECT id FROM module WHERE code = 'property_management'), 'property_type', 'Property Type', 'property_type', 60),
    ((SELECT id FROM module WHERE code = 'property_management'), 'deed', 'Property Deed', 'property_deed', 70),
    ((SELECT id FROM module WHERE code = 'property_management'), 'property_expense', 'Property Expense', 'property_expense', 65),
    
    -- Vehicle management module
    ((SELECT id FROM module WHERE code = 'vehicle_management'), 'vehicle', 'Vehicle', 'vehicle', 80),
    ((SELECT id FROM module WHERE code = 'vehicle_management'), 'vehicle_type', 'Vehicle Type', 'vehicle_type', 55),
    ((SELECT id FROM module WHERE code = 'vehicle_management'), 'vehicle_maintenance', 'Vehicle Maintenance', 'vehicle_maintenance', 60),
    
    -- Luxury assets module
    ((SELECT id FROM module WHERE code = 'luxury_assets'), 'luxury_asset', 'Luxury Asset', 'luxury_asset', 75),
    ((SELECT id FROM module WHERE code = 'luxury_assets'), 'artwork', 'Artwork', 'artwork', 70),
    ((SELECT id FROM module WHERE code = 'luxury_assets'), 'jewelry', 'Jewelry', 'jewelry', 70),
    
    -- AI insights module
    ((SELECT id FROM module WHERE code = 'ai_insights'), 'ai_insight', 'AI Insight', 'ai_insight', 65),
    ((SELECT id FROM module WHERE code = 'ai_insights'), 'chat_conversation', 'Chat Conversation', 'chat_conversation', 60);
```

### 2. Universal Things Table

```sql
-- Universal searchable entity table
CREATE TABLE thing (
    id UUID PRIMARY KEY, -- Same as the concrete entity's ID
    thing_type_id UUID NOT NULL REFERENCES thing_type(id),
    
    -- Primary searchable fields (duplicated from concrete tables)
    name TEXT NOT NULL,
    title TEXT, -- Alternative/display name
    code VARCHAR(10), -- Ticker, symbol, account number, ISO codes, etc. (10 chars max)
    subtitle TEXT, -- Description, tagline, etc.
    notes TEXT, -- Unstructured notes field
    
    -- Ownership and organization
    owner_user_id UUID, -- References user(id)
    organization_id UUID, -- References organization(id)
    
    -- Search and classification
    category TEXT, -- High-level category
    subcategory TEXT, -- Detailed classification
    
    -- Financial context (when applicable)
    currency TEXT,
    value_amount DECIMAL(20, 2), -- Current/latest value
    
    -- Status and metadata
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'deleted'
    is_public BOOLEAN DEFAULT false, -- Searchable by other users
    metadata JSONB, -- Flexible additional data
    
    -- Full-text search optimization (updated to include tags via join)
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(code, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(subtitle, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(notes, '')), 'C')
    ) STORED,
    
    -- Vector embedding for AI semantic search
    embedding VECTOR(1536),
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);

-- Global tags that can be used by anyone
CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- Tag name (e.g., 'high-growth', 'dividend-stock')
    slug VARCHAR(50) NOT NULL UNIQUE, -- URL-friendly version (e.g., 'high-growth', 'dividend-stock')
    description TEXT,
    color VARCHAR(7), -- Hex color code (#FF5733)
    icon TEXT, -- Icon identifier
    
    -- Tag metadata
    category TEXT, -- 'system', 'financial', 'personal', etc.
    is_system BOOLEAN DEFAULT false, -- System-defined tags vs user-created
    usage_count INTEGER DEFAULT 0, -- How many times this tag has been used
    
    -- Creator information
    created_by_user_id UUID REFERENCES user(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personal tags - user-specific versions of tags
CREATE TABLE personal_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id),
    tag_id UUID NOT NULL REFERENCES tag(id),
    
    -- Personal customization
    personal_name VARCHAR(50), -- User can rename the tag for themselves
    personal_color VARCHAR(7), -- User can change color
    personal_notes TEXT, -- Personal notes about this tag
    
    -- Personal settings
    is_favorite BOOLEAN DEFAULT false, -- User's favorite tags
    is_private BOOLEAN DEFAULT false, -- Only visible to this user
    sort_order INTEGER DEFAULT 0, -- User's preferred ordering
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0, -- How many times this user has used this tag
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one personal tag per user per tag
    UNIQUE(user_id, tag_id)
);

-- Links between things and tags
CREATE TABLE thing_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thing_id UUID NOT NULL REFERENCES thing(id),
    tag_id UUID NOT NULL REFERENCES tag(id),
    user_id UUID NOT NULL REFERENCES user(id), -- Who applied this tag
    
    -- Tag application context
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    confidence DECIMAL(3,2), -- AI-applied tags can have confidence scores (0.00-1.00)
    source TEXT DEFAULT 'manual', -- 'manual', 'ai', 'import', 'system'
    notes TEXT, -- Why this tag was applied
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one tag per thing per user (users can't duplicate their own tags)
    UNIQUE(thing_id, tag_id, user_id)
);3,2), -- AI-applied tags can have confidence scores (0.00-1.00)
    source TEXT DEFAULT 'manual', -- 'manual', 'ai', 'import', 'system'
    notes TEXT, -- Why this tag was applied
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one tag per thing per user (users can't duplicate their own tags)
    UNIQUE(thing_id, tag_id, user_id)
);
```

### 3. Users & Organizations

```sql
-- Core user table with temporal support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    hanko_user_id TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);

-- Organizations for family offices and institutions
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT, -- Abbreviated name
    type TEXT NOT NULL CHECK (type IN ('family_office', 'institution', 'individual')),
    description TEXT,
    settings JSONB,
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Currencies as searchable entities
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- 'USD', 'EUR', 'GBP'
    name TEXT NOT NULL, -- 'US Dollar'
    symbol TEXT, -- '

## Tagging and Search Functions

```sql
-- Function to get all tags for a thing as viewed by a specific user
CREATE OR REPLACE FUNCTION get_thing_tags_for_user(
    thing_uuid UUID,
    user_uuid UUID
)
RETURNS TABLE (
    tag_id UUID,
    tag_name TEXT,
    personal_name TEXT,
    color TEXT,
    is_personal BOOLEAN,
    applied_by_user_id UUID,
    applied_at TIMESTAMPTZ
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        COALESCE(pt.personal_name, t.name) as display_name,
        COALESCE(pt.personal_color, t.color) as display_color,
        (pt.id IS NOT NULL) as is_personal,
        tt.user_id,
        tt.applied_at
    FROM thing_tags tt
    JOIN tags t ON tt.tag_id = t.id
    LEFT JOIN personal_tags pt ON t.id = pt.tag_id AND pt.user_id = user_uuid
    WHERE tt.thing_id = thing_uuid
        AND (tt.user_id = user_uuid OR t.is_system = true OR pt.is_private = false)
        AND tt.valid_to > NOW()
    ORDER BY tt.applied_at DESC;
END;
$ LANGUAGE plpgsql;

-- Function to search things by tags
CREATE OR REPLACE FUNCTION search_things_by_tags(
    tag_names TEXT[],
    user_uuid UUID,
    match_all BOOLEAN DEFAULT false, -- true = AND, false = OR
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    thing_id UUID,
    thing_name TEXT,
    thing_code VARCHAR(10),
    matching_tags TEXT[],
    tag_count INTEGER
) AS $
BEGIN
    IF match_all THEN
        -- All tags must match (AND logic)
        RETURN QUERY
        SELECT 
            t.id,
            t.name,
            t.code,
            array_agg(DISTINCT tag.name) as matching_tags,
            count(DISTINCT tt.tag_id)::INTEGER as tag_count
        FROM things t
        JOIN thing_tags tt ON t.id = tt.thing_id
        JOIN tags tag ON tt.tag_id = tag.id
        LEFT JOIN personal_tags pt ON tag.id = pt.tag_id AND pt.user_id = user_uuid
        WHERE 
            (LOWER(tag.name) = ANY(array_agg(LOWER(unnest))) FROM unnest(tag_names) AS unnest)
            OR (LOWER(pt.personal_name) = ANY(array_agg(LOWER(unnest))) FROM unnest(tag_names) AS unnest)
        GROUP BY t.id, t.name, t.code
        HAVING count(DISTINCT tt.tag_id) = array_length(tag_names, 1)
        ORDER BY t.name
        LIMIT limit_count;
    ELSE
        -- Any tag can match (OR logic)
        RETURN QUERY
        SELECT 
            t.id,
            t.name,
            t.code,
            array_agg(DISTINCT tag.name) as matching_tags,
            count(DISTINCT tt.tag_id)::INTEGER as tag_count
        FROM things t
        JOIN thing_tags tt ON t.id = tt.thing_id
        JOIN tags tag ON tt.tag_id = tag.id
        LEFT JOIN personal_tags pt ON tag.id = pt.tag_id AND pt.user_id = user_uuid
        WHERE 
            LOWER(tag.name) = ANY(SELECT LOWER(unnest) FROM unnest(tag_names) AS unnest)
            OR LOWER(pt.personal_name) = ANY(SELECT LOWER(unnest) FROM unnest(tag_names) AS unnest)
        GROUP BY t.id, t.name, t.code
        ORDER BY tag_count DESC, t.name
        LIMIT limit_count;
    END IF;
END;
$ LANGUAGE plpgsql;

-- Function to create or get a tag (handles deduplication)
CREATE OR REPLACE FUNCTION create_or_get_tag(
    tag_name TEXT,
    user_uuid UUID,
    tag_color TEXT DEFAULT NULL,
    tag_category TEXT DEFAULT 'user'
)
RETURNS UUID AS $
DECLARE
    tag_uuid UUID;
    tag_slug TEXT;
BEGIN
    -- Create URL-friendly slug
    tag_slug := lower(regexp_replace(trim(tag_name), '[^a-zA-Z0-9]+', '-', 'g'));
    tag_slug := regexp_replace(tag_slug, '^-+|-+

```sql
-- Function to get all required modules for a user (resolves dependencies)
CREATE OR REPLACE FUNCTION get_required_modules_for_user(target_user_id UUID)
RETURNS TABLE (
    module_id UUID,
    module_code TEXT,
    module_name TEXT,
    license_status TEXT,
    dependency_chain TEXT[]
) AS $
WITH RECURSIVE module_deps AS (
    -- Base case: directly licensed modules
    SELECT 
        m.id as module_id,
        m.code as module_code,
        m.name as module_name,
        uml.license_status,
        ARRAY[m.code] as dependency_chain,
        0 as depth
    FROM modules m
    JOIN user_module_licenses uml ON m.id = uml.module_id
    WHERE uml.user_id = target_user_id
      AND uml.license_status = 'active'
      AND uml.valid_to > NOW()
    
    UNION
    
    -- Recursive case: required dependencies
    SELECT 
        dm.id as module_id,
        dm.code as module_code, 
        dm.name as module_name,
        COALESCE(uml.license_status, 'required') as license_status,
        md.dependency_chain || dm.code,
        md.depth + 1
    FROM module_deps md
    JOIN module_dependencies mdep ON md.module_id = mdep.module_id
    JOIN modules dm ON mdep.depends_on_module_id = dm.id
    LEFT JOIN user_module_licenses uml ON dm.id = uml.module_id AND uml.user_id = target_user_id
    WHERE mdep.dependency_type = 'required'
      AND md.depth < 10 -- Prevent infinite recursion
      AND NOT dm.code = ANY(md.dependency_chain) -- Prevent circular deps
)
SELECT DISTINCT 
    module_id,
    module_code,
    module_name,
    license_status,
    dependency_chain
FROM module_deps
ORDER BY module_code;
$ LANGUAGE sql;

-- Function to check if user has access to a specific thing type
CREATE OR REPLACE FUNCTION user_has_access_to_thing_type(
    target_user_id UUID,
    thing_type_code TEXT
)
RETURNS BOOLEAN AS $
DECLARE
    required_module_code TEXT;
    has_license BOOLEAN;
BEGIN
    -- Get the module required for this thing type
    SELECT m.code INTO required_module_code
    FROM thing_types tt
    JOIN modules m ON tt.module_id = m.id
    WHERE tt.code = thing_type_code;
    
    IF required_module_code IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user has active license (including dependencies)
    SELECT EXISTS (
        SELECT 1 FROM get_required_modules_for_user(target_user_id)
        WHERE module_code = required_module_code
          AND license_status IN ('active', 'trial')
    ) INTO has_license;
    
    RETURN has_license;
END;
$ LANGUAGE plpgsql;

-- Function to get licensing requirements for a set of modules
CREATE OR REPLACE FUNCTION get_licensing_requirements(module_codes TEXT[])
RETURNS TABLE (
    module_code TEXT,
    module_name TEXT,
    license_type TEXT,
    monthly_price DECIMAL(10,2),
    dependency_type TEXT,
    depends_on_module TEXT
) AS $
WITH RECURSIVE required_modules AS (
    -- Base case: requested modules
    SELECT 
        m.id,
        m.code,
        m.name,
        m.license_type,
        m.monthly_price,
        'direct'::TEXT as dependency_type,
        NULL::TEXT as depends_on_module,
        ARRAY[m.code] as module_chain,
        0 as depth
    FROM modules m
    WHERE m.code = ANY(module_codes)
      AND m.is_active = true
    
    UNION
    
    -- Recursive case: required dependencies
    SELECT 
        dm.id,
        dm.code,
        dm.name, 
        dm.license_type,
        dm.monthly_price,
        mdep.dependency_type,
        rm.code as depends_on_module,
        rm.module_chain || dm.code,
        rm.depth + 1
    FROM required_modules rm
    JOIN module_dependencies mdep ON rm.id = mdep.module_id
    JOIN modules dm ON mdep.depends_on_module_id = dm.id
    WHERE mdep.dependency_type = 'required'
      AND rm.depth < 10
      AND NOT dm.code = ANY(rm.module_chain)
)
SELECT DISTINCT
    rm.code,
    rm.name,
    rm.license_type,
    rm.monthly_price,
    rm.dependency_type,
    rm.depends_on_module
FROM required_modules rm
ORDER BY rm.code;
$ LANGUAGE sql;
```

```sql
-- Function to automatically maintain the things table
CREATE OR REPLACE FUNCTION sync_thing()
RETURNS TRIGGER AS $
DECLARE
    thing_type_record RECORD;
    thing_name TEXT;
    thing_title TEXT;
    thing_code TEXT;
    thing_subtitle TEXT;
    owner_id UUID;
    org_id UUID;
    thing_currency TEXT;
    thing_value DECIMAL(20, 2);
    thing_category TEXT;
    thing_subcategory TEXT;
BEGIN
    -- Get thing type information
    SELECT * INTO thing_type_record 
    FROM thing_types 
    WHERE table_name = TG_TABLE_NAME;
    
    IF thing_type_record IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Extract common fields based on table
    CASE TG_TABLE_NAME
        WHEN 'users' THEN
            thing_name := COALESCE(NEW.display_name, NEW.first_name || ' ' || NEW.last_name, NEW.email);
            thing_code := NEW.email;
            owner_id := NEW.id;
            
        WHEN 'organizations' THEN
            thing_name := NEW.name;
            thing_title := NEW.short_name;
            thing_subtitle := NEW.description;
            thing_category := NEW.type;
            
        WHEN 'accounts' THEN
            thing_name := NEW.name;
            thing_code := NEW.account_number;
            thing_subtitle := NEW.institution;
            owner_id := NEW.user_id;
            org_id := NEW.organization_id;
            thing_currency := NEW.currency;
            thing_category := NEW.account_type;
            
        WHEN 'instruments' THEN
            thing_name := NEW.name;
            thing_code := NEW.symbol;
            thing_subtitle := NEW.exchange;
            thing_currency := NEW.currency;
            thing_category := 'instrument';
            thing_subcategory := NEW.sector;
            
        WHEN 'non_fungible_holdings' THEN
            thing_name := NEW.name;
            thing_subtitle := NEW.description;
            owner_id := NEW.user_id;
            org_id := NEW.organization_id;
            thing_currency := NEW.currency;
            thing_value := NEW.current_value;
            
        WHEN 'currencies' THEN
            thing_name := NEW.name;
            thing_code := NEW.code;
            thing_title := NEW.symbol;
            thing_category := 'currency';
            
        -- Add more cases as needed for other tables
        ELSE
            thing_name := 'Unknown';
    END CASE;
    
    -- Insert or update in things table
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO things (
            id, thing_type_id, name, title, code, subtitle,
            owner_user_id, organization_id, currency, value_amount,
            category, subcategory, valid_from, valid_to, transaction_time
        ) VALUES (
            NEW.id, thing_type_record.id, thing_name, thing_title, thing_code, thing_subtitle,
            owner_id, org_id, thing_currency, thing_value,
            thing_category, thing_subcategory, NEW.valid_from, NEW.valid_to, NEW.transaction_time
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            title = EXCLUDED.title,
            code = EXCLUDED.code,
            subtitle = EXCLUDED.subtitle,
            owner_user_id = EXCLUDED.owner_user_id,
            organization_id = EXCLUDED.organization_id,
            currency = EXCLUDED.currency,
            value_amount = EXCLUDED.value_amount,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            valid_from = EXCLUDED.valid_from,
            valid_to = EXCLUDED.valid_to,
            transaction_time = EXCLUDED.transaction_time;
            
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE things 
        SET status = 'deleted', 
            valid_to = OLD.valid_to,
            transaction_time = OLD.transaction_time
        WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Universal search function for users and AI agents
CREATE OR REPLACE FUNCTION search_things(
    search_query TEXT,
    user_id UUID DEFAULT NULL,
    thing_types TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    thing_type_code TEXT,
    name TEXT,
    title TEXT,
    code TEXT,
    subtitle TEXT,
    category TEXT,
    rank REAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        tt.code,
        t.name,
        t.title,
        t.code,
        t.subtitle,
        t.category,
        ts_rank(t.search_vector, websearch_to_tsquery('english', search_query)) as rank
    FROM things t
    JOIN thing_types tt ON t.thing_type_id = tt.id
    WHERE 
        (user_id IS NULL OR t.owner_user_id = user_id OR t.is_public = true)
        AND (thing_types IS NULL OR tt.code = ANY(thing_types))
        AND t.status = 'active'
        AND (
            t.search_vector @@ websearch_to_tsquery('english', search_query)
            OR t.name ILIKE '%' || search_query || '%'
            OR t.code ILIKE '%' || search_query || '%'
        )
        AND t.valid_to > NOW()
    ORDER BY rank DESC, tt.search_weight DESC, t.name
    LIMIT limit_count;
END;
$ LANGUAGE plpgsql;

-- AI semantic search function using vector embeddings
CREATE OR REPLACE FUNCTION search_things_semantic(
    query_embedding VECTOR(1536),
    user_id UUID DEFAULT NULL,
    thing_types TEXT[] DEFAULT NULL,
    similarity_threshold REAL DEFAULT 0.7,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    thing_type_code TEXT,
    name TEXT,
    similarity REAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        tt.code,
        t.name,
        1 - (t.embedding <=> query_embedding) as similarity
    FROM things t
    JOIN thing_types tt ON t.thing_type_id = tt.id
    WHERE 
        (user_id IS NULL OR t.owner_user_id = user_id OR t.is_public = true)
        AND (thing_types IS NULL OR tt.code = ANY(thing_types))
        AND t.status = 'active'
        AND t.embedding IS NOT NULL
        AND 1 - (t.embedding <=> query_embedding) > similarity_threshold
        AND t.valid_to > NOW()
    ORDER BY similarity DESC
    LIMIT limit_count;
END;
$ LANGUAGE plpgsql;
```

### 4. Asset Type Definitions

```sql
-- Master table for all asset types
CREATE TABLE asset_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE, -- 'STOCK', 'PROPERTY', 'CASH', etc. (10 chars max)
    name TEXT NOT NULL, -- No length limit
    category TEXT NOT NULL CHECK (category IN ('fungible', 'non_fungible')),
    subcategory TEXT, -- 'equity', 'fixed_income', 'real_estate', etc.
    description TEXT,
    metadata JSONB, -- Type-specific configuration
    notes TEXT, -- Unstructured notes
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Specific instruments for fungible assets (stocks, bonds, etc.)
CREATE TABLE instrument (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type_id UUID NOT NULL REFERENCES asset_type(id),
    symbol VARCHAR(10), -- Ticker symbol (10 chars max) - this is the code for instruments
    isin VARCHAR(12), -- International identifier (ISIN is always 12 chars)
    cusip VARCHAR(9), -- US identifier (CUSIP is always 9 chars)
    name TEXT NOT NULL, -- No length limit
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- Currency code
    exchange TEXT,
    sector TEXT,
    metadata JSONB,
    notes TEXT, -- Unstructured notes
    -- Vector embedding for AI similarity search
    embedding VECTOR(1536),
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Fungible Asset Holdings

```sql
-- Holdings for fungible assets (shares, cash, etc.)
CREATE TABLE fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    account_id UUID NOT NULL, -- References accounts table
    
    -- Quantity and cost basis
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost_per_unit DECIMAL(20, 8),
    total_cost_basis DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Metadata for additional tracking
    lot_method TEXT DEFAULT 'FIFO', -- FIFO, LIFO, specific_identification
    metadata JSONB,
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);

-- Individual lots for tax optimization (specific identification)
CREATE TABLE fungible_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES fungible_holdings(id),
    quantity DECIMAL(20, 8) NOT NULL,
    cost_per_unit DECIMAL(20, 8) NOT NULL,
    acquisition_date DATE NOT NULL,
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Non-Fungible Asset Holdings

```sql
-- Holdings for non-fungible assets (properties, vehicles, etc.)
CREATE TABLE non_fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    asset_type_id UUID NOT NULL REFERENCES asset_types(id),
    
    -- Unique asset identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Financial details
    acquisition_cost DECIMAL(20, 2),
    acquisition_date DATE,
    current_value DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Location and physical attributes
    location JSONB, -- Address, coordinates, etc.
    physical_attributes JSONB, -- Size, year, condition, etc.
    
    -- Legal and ownership details
    ownership_percentage DECIMAL(5, 4) DEFAULT 1.0000, -- For fractional ownership
    legal_documents JSONB, -- Deed, title, registration, etc.
    
    -- Asset-specific metadata
    metadata JSONB, -- Property: bedrooms, bathrooms; Vehicle: VIN, make, model
    
    -- Vector embedding for similarity search
    embedding VECTOR(1536),
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);
```

### 5. Transactions

```sql
-- Unified transaction table for all asset types
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN 
        ('buy', 'sell', 'dividend', 'interest', 'split', 'transfer', 'deposit', 'withdrawal')),
    transaction_date DATE NOT NULL,
    settlement_date DATE,
    
    -- Asset reference (polymorphic)
    fungible_holding_id UUID REFERENCES fungible_holdings(id),
    non_fungible_holding_id UUID REFERENCES non_fungible_holdings(id),
    
    -- Financial details
    quantity DECIMAL(20, 8), -- For fungible assets
    price_per_unit DECIMAL(20, 8), -- For fungible assets
    total_amount DECIMAL(20, 2) NOT NULL,
    fees DECIMAL(20, 2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- References
    account_id UUID NOT NULL,
    counterparty TEXT, -- Broker, exchange, individual
    reference_number TEXT, -- Confirmation number, etc.
    
    -- Metadata and notes
    notes TEXT,
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ,
    
    -- Constraints
    CHECK ((fungible_holding_id IS NULL) != (non_fungible_holding_id IS NULL))
);
```

### 5. Accounts & Portfolios

```sql
-- Accounts (brokerage, bank, etc.)
CREATE TABLE account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id),
    organization_id UUID REFERENCES organization(id),
    
    name TEXT NOT NULL, -- No length limit
    account_type TEXT NOT NULL CHECK (account_type IN 
        ('brokerage', 'bank', 'retirement', 'trust', 'entity')),
    account_number VARCHAR(10), -- Account number as code (10 chars max)
    institution TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- Currency code
    
    -- Account settings
    is_active BOOLEAN DEFAULT true,
    tax_treatment TEXT, -- 'taxable', 'tax_deferred', 'tax_free'
    
    metadata JSONB,
    notes TEXT, -- Unstructured notes
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio groupings
CREATE TABLE portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id),
    organization_id UUID REFERENCES organization(id),
    
    name TEXT NOT NULL, -- No length limit
    code VARCHAR(10), -- Portfolio code/identifier (10 chars max)
    description TEXT,
    portfolio_type TEXT DEFAULT 'standard',
    
    -- Portfolio configuration
    benchmark_symbol VARCHAR(10), -- For performance comparison (10 chars max)
    target_allocation JSONB, -- Desired asset allocation
    rebalancing_rules JSONB,
    
    notes TEXT, -- Unstructured notes
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-organization relationships
CREATE TABLE user_organization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id),
    organization_id UUID NOT NULL REFERENCES organization(id),
    role TEXT NOT NULL,
    permissions JSONB,
    notes TEXT, -- Unstructured notes
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Account-Portfolio relationships
CREATE TABLE portfolio_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolio(id),
    account_id UUID NOT NULL REFERENCES account(id),
    weight DECIMAL(5, 4), -- Portfolio weighting
    notes TEXT, -- Unstructured notes
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7. Market Data & Valuations

```sql
-- Market prices for fungible assets
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    price_date DATE NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    source TEXT NOT NULL, -- 'bloomberg', 'yahoo', etc.
    price_type TEXT DEFAULT 'close', -- 'open', 'high', 'low', 'close'
    volume BIGINT,
    metadata JSONB,
    
    -- Temporal support (for price corrections)
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(instrument_id, price_date, price_type, valid_from)
);

-- Valuations for non-fungible assets
CREATE TABLE asset_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    non_fungible_holding_id UUID NOT NULL REFERENCES non_fungible_holdings(id),
    valuation_date DATE NOT NULL,
    value DECIMAL(20, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    valuation_method TEXT NOT NULL, -- 'appraisal', 'comparable_sales', 'cost', etc.
    appraiser TEXT,
    confidence_level TEXT, -- 'high', 'medium', 'low'
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8. AI & Analytics Support

```sql
-- Store AI analysis results
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    insight_type TEXT NOT NULL, -- 'recommendation', 'risk_analysis', 'allocation_advice'
    content JSONB NOT NULL,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    expires_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversation history
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Triggers to Maintain Things Table

```sql
-- Create triggers for all searchable tables
DO $ 
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM thing_types t 
        WHERE t.is_searchable = true
    LOOP
        EXECUTE format('
            CREATE TRIGGER sync_things_%s_trigger
            AFTER INSERT OR UPDATE OR DELETE ON %I
            FOR EACH ROW EXECUTE FUNCTION sync_thing();
        ', table_name, table_name);
    END LOOP;
END $;

-- Example trigger creation (would be auto-generated)
CREATE TRIGGER sync_things_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION sync_thing();

CREATE TRIGGER sync_things_accounts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON accounts
    FOR EACH ROW EXECUTE FUNCTION sync_thing();

CREATE TRIGGER sync_things_instruments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON instruments
    FOR EACH ROW EXECUTE FUNCTION sync_thing();
```

## Indexes and Performance Optimization

```sql
-- Universal search indexes
CREATE INDEX things_search_vector_idx ON things USING gin(search_vector);
CREATE INDEX things_owner_status_idx ON things (owner_user_id, status, valid_to);
CREATE INDEX things_type_category_idx ON things (thing_type_id, category);
CREATE INDEX things_name_gin_idx ON things USING gin(name gin_trgm_ops);
CREATE INDEX things_code_gin_idx ON things USING gin(code gin_trgm_ops);

-- Vector similarity search indexes
CREATE INDEX things_embedding_idx ON things USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX instruments_embedding_idx ON instruments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX non_fungible_holdings_embedding_idx ON non_fungible_holdings USING ivfflat (embedding vector_cosine_ops);

-- Temporal query indexes
CREATE INDEX ON fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON non_fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON transactions (user_id, transaction_date, valid_from, valid_to);
CREATE INDEX ON market_prices (instrument_id, price_date, valid_from);

-- Performance indexes
CREATE INDEX ON transactions (fungible_holding_id) WHERE fungible_holding_id IS NOT NULL;
CREATE INDEX ON transactions (non_fungible_holding_id) WHERE non_fungible_holding_id IS NOT NULL;
CREATE INDEX ON fungible_holdings (instrument_id);
CREATE INDEX ON non_fungible_holdings (asset_type_id);
```

## Temporal Query Examples

```sql
-- Point-in-time portfolio value
SELECT 
    fh.instrument_id,
    i.name,
    fh.quantity,
    mp.price,
    (fh.quantity * mp.price) as market_value
FROM fungible_holdings fh
JOIN instruments i ON fh.instrument_id = i.id
JOIN market_prices mp ON mp.instrument_id = i.id
WHERE fh.user_id = $1
    AND fh.valid_from <= $2 AND fh.valid_to > $2  -- Point in time
    AND mp.price_date = $2;

-- Historical corrections with audit trail
SELECT 
    transaction_time,
    valid_from,
    valid_to,
    quantity,
    'CORRECTED' as status
FROM fungible_holdings 
WHERE id = $1 
ORDER BY transaction_time;
```

This data model provides:
- ✅ Clear separation of fungible and non-fungible assets
- ✅ Comprehensive temporal support for all entities
- ✅ Vector search capabilities for AI features
- ✅ Flexible metadata storage with JSONB
- ✅ Audit trails and historical corrections
- ✅ Performance optimization for common queries
- ✅ Support for complex portfolio structures
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Asset Type Definitions

```sql
-- Master table for all asset types
CREATE TABLE asset_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- 'STOCK', 'PROPERTY', 'CASH', etc.
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fungible', 'non_fungible')),
    subcategory TEXT, -- 'equity', 'fixed_income', 'real_estate', etc.
    metadata JSONB, -- Type-specific configuration
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Specific instruments for fungible assets (stocks, bonds, etc.)
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type_id UUID NOT NULL REFERENCES asset_types(id),
    symbol TEXT, -- Ticker symbol
    isin TEXT, -- International identifier
    cusip TEXT, -- US identifier
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    exchange TEXT,
    sector TEXT,
    metadata JSONB,
    -- Vector embedding for AI similarity search
    embedding VECTOR(1536),
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Fungible Asset Holdings

```sql
-- Holdings for fungible assets (shares, cash, etc.)
CREATE TABLE fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    account_id UUID NOT NULL, -- References accounts table
    
    -- Quantity and cost basis
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost_per_unit DECIMAL(20, 8),
    total_cost_basis DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Metadata for additional tracking
    lot_method TEXT DEFAULT 'FIFO', -- FIFO, LIFO, specific_identification
    metadata JSONB,
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);

-- Individual lots for tax optimization (specific identification)
CREATE TABLE fungible_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES fungible_holdings(id),
    quantity DECIMAL(20, 8) NOT NULL,
    cost_per_unit DECIMAL(20, 8) NOT NULL,
    acquisition_date DATE NOT NULL,
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Non-Fungible Asset Holdings

```sql
-- Holdings for non-fungible assets (properties, vehicles, etc.)
CREATE TABLE non_fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    asset_type_id UUID NOT NULL REFERENCES asset_types(id),
    
    -- Unique asset identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Financial details
    acquisition_cost DECIMAL(20, 2),
    acquisition_date DATE,
    current_value DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Location and physical attributes
    location JSONB, -- Address, coordinates, etc.
    physical_attributes JSONB, -- Size, year, condition, etc.
    
    -- Legal and ownership details
    ownership_percentage DECIMAL(5, 4) DEFAULT 1.0000, -- For fractional ownership
    legal_documents JSONB, -- Deed, title, registration, etc.
    
    -- Asset-specific metadata
    metadata JSONB, -- Property: bedrooms, bathrooms; Vehicle: VIN, make, model
    
    -- Vector embedding for similarity search
    embedding VECTOR(1536),
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);
```

### 5. Transactions

```sql
-- Unified transaction table for all asset types
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN 
        ('buy', 'sell', 'dividend', 'interest', 'split', 'transfer', 'deposit', 'withdrawal')),
    transaction_date DATE NOT NULL,
    settlement_date DATE,
    
    -- Asset reference (polymorphic)
    fungible_holding_id UUID REFERENCES fungible_holdings(id),
    non_fungible_holding_id UUID REFERENCES non_fungible_holdings(id),
    
    -- Financial details
    quantity DECIMAL(20, 8), -- For fungible assets
    price_per_unit DECIMAL(20, 8), -- For fungible assets
    total_amount DECIMAL(20, 2) NOT NULL,
    fees DECIMAL(20, 2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- References
    account_id UUID NOT NULL,
    counterparty TEXT, -- Broker, exchange, individual
    reference_number TEXT, -- Confirmation number, etc.
    
    -- Metadata and notes
    notes TEXT,
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ,
    
    -- Constraints
    CHECK ((fungible_holding_id IS NULL) != (non_fungible_holding_id IS NULL))
);
```

### 6. Accounts & Portfolios

```sql
-- Accounts (brokerage, bank, etc.)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN 
        ('brokerage', 'bank', 'retirement', 'trust', 'entity')),
    account_number TEXT,
    institution TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Account settings
    is_active BOOLEAN DEFAULT true,
    tax_treatment TEXT, -- 'taxable', 'tax_deferred', 'tax_free'
    
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio groupings
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    name TEXT NOT NULL,
    description TEXT,
    portfolio_type TEXT DEFAULT 'standard',
    
    -- Portfolio configuration
    benchmark_symbol TEXT, -- For performance comparison
    target_allocation JSONB, -- Desired asset allocation
    rebalancing_rules JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Account-Portfolio relationships
CREATE TABLE portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    weight DECIMAL(5, 4), -- Portfolio weighting
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7. Market Data & Valuations

```sql
-- Market prices for fungible assets
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    price_date DATE NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    source TEXT NOT NULL, -- 'bloomberg', 'yahoo', etc.
    price_type TEXT DEFAULT 'close', -- 'open', 'high', 'low', 'close'
    volume BIGINT,
    metadata JSONB,
    
    -- Temporal support (for price corrections)
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(instrument_id, price_date, price_type, valid_from)
);

-- Valuations for non-fungible assets
CREATE TABLE asset_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    non_fungible_holding_id UUID NOT NULL REFERENCES non_fungible_holdings(id),
    valuation_date DATE NOT NULL,
    value DECIMAL(20, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    valuation_method TEXT NOT NULL, -- 'appraisal', 'comparable_sales', 'cost', etc.
    appraiser TEXT,
    confidence_level TEXT, -- 'high', 'medium', 'low'
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8. AI & Analytics Support

```sql
-- Store AI analysis results
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    insight_type TEXT NOT NULL, -- 'recommendation', 'risk_analysis', 'allocation_advice'
    content JSONB NOT NULL,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    expires_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversation history
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes and Performance Optimization

```sql
-- Temporal query indexes
CREATE INDEX ON fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON non_fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON transactions (user_id, transaction_date, valid_from, valid_to);
CREATE INDEX ON market_prices (instrument_id, price_date, valid_from);

-- Vector similarity search indexes
CREATE INDEX ON instruments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON non_fungible_holdings USING ivfflat (embedding vector_cosine_ops);

-- Performance indexes
CREATE INDEX ON transactions (fungible_holding_id) WHERE fungible_holding_id IS NOT NULL;
CREATE INDEX ON transactions (non_fungible_holding_id) WHERE non_fungible_holding_id IS NOT NULL;
CREATE INDEX ON fungible_holdings (instrument_id);
CREATE INDEX ON non_fungible_holdings (asset_type_id);
```

## Temporal Query Examples

```sql
-- Point-in-time portfolio value
SELECT 
    fh.instrument_id,
    i.name,
    fh.quantity,
    mp.price,
    (fh.quantity * mp.price) as market_value
FROM fungible_holdings fh
JOIN instruments i ON fh.instrument_id = i.id
JOIN market_prices mp ON mp.instrument_id = i.id
WHERE fh.user_id = $1
    AND fh.valid_from <= $2 AND fh.valid_to > $2  -- Point in time
    AND mp.price_date = $2;

-- Historical corrections with audit trail
SELECT 
    transaction_time,
    valid_from,
    valid_to,
    quantity,
    'CORRECTED' as status
FROM fungible_holdings 
WHERE id = $1 
ORDER BY transaction_time;
```

This data model provides:
- ✅ Clear separation of fungible and non-fungible assets
- ✅ Comprehensive temporal support for all entities
- ✅ Vector search capabilities for AI features
- ✅ Flexible metadata storage with JSONB
- ✅ Audit trails and historical corrections
- ✅ Performance optimization for common queries
- ✅ Support for complex portfolio structures, '', 'g');
    
    -- Try to find existing tag
    SELECT id INTO tag_uuid
    FROM tags
    WHERE LOWER(name) = LOWER(trim(tag_name))
        AND valid_to > NOW();
    
    -- Create new tag if it doesn't exist
    IF tag_uuid IS NULL THEN
        INSERT INTO tags (name, slug, color, category, created_by_user_id)
        VALUES (trim(tag_name), tag_slug, tag_color, tag_category, user_uuid)
        RETURNING id INTO tag_uuid;
        
        -- Update usage count
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = tag_uuid;
    END IF;
    
    -- Create or update personal tag
    INSERT INTO personal_tags (user_id, tag_id, personal_color, last_used_at)
    VALUES (user_uuid, tag_uuid, tag_color, NOW())
    ON CONFLICT (user_id, tag_id) DO UPDATE SET
        last_used_at = NOW(),
        usage_count = personal_tags.usage_count + 1;
    
    RETURN tag_uuid;
END;
$ LANGUAGE plpgsql;

-- Function to apply tags to a thing
CREATE OR REPLACE FUNCTION apply_tags_to_thing(
    thing_uuid UUID,
    tag_names TEXT[],
    user_uuid UUID,
    tag_source TEXT DEFAULT 'manual'
)
RETURNS INTEGER AS $
DECLARE
    tag_name TEXT;
    tag_uuid UUID;
    tags_applied INTEGER := 0;
BEGIN
    FOREACH tag_name IN ARRAY tag_names
    LOOP
        -- Create or get the tag
        tag_uuid := create_or_get_tag(tag_name, user_uuid);
        
        -- Apply tag to thing
        INSERT INTO thing_tags (thing_id, tag_id, user_id, source)
        VALUES (thing_uuid, tag_uuid, user_uuid, tag_source)
        ON CONFLICT (thing_id, tag_id, user_id) DO NOTHING;
        
        -- Count if new application
        IF FOUND THEN
            tags_applied := tags_applied + 1;
        END IF;
    END LOOP;
    
    RETURN tags_applied;
END;
$ LANGUAGE plpgsql;

-- Trigger to update tag usage counts
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.tag_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER tag_usage_count_trigger
    AFTER INSERT OR DELETE ON thing_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();
```

```sql
-- Function to get all required modules for a user (resolves dependencies)
CREATE OR REPLACE FUNCTION get_required_modules_for_user(target_user_id UUID)
RETURNS TABLE (
    module_id UUID,
    module_code TEXT,
    module_name TEXT,
    license_status TEXT,
    dependency_chain TEXT[]
) AS $
WITH RECURSIVE module_deps AS (
    -- Base case: directly licensed modules
    SELECT 
        m.id as module_id,
        m.code as module_code,
        m.name as module_name,
        uml.license_status,
        ARRAY[m.code] as dependency_chain,
        0 as depth
    FROM modules m
    JOIN user_module_licenses uml ON m.id = uml.module_id
    WHERE uml.user_id = target_user_id
      AND uml.license_status = 'active'
      AND uml.valid_to > NOW()
    
    UNION
    
    -- Recursive case: required dependencies
    SELECT 
        dm.id as module_id,
        dm.code as module_code, 
        dm.name as module_name,
        COALESCE(uml.license_status, 'required') as license_status,
        md.dependency_chain || dm.code,
        md.depth + 1
    FROM module_deps md
    JOIN module_dependencies mdep ON md.module_id = mdep.module_id
    JOIN modules dm ON mdep.depends_on_module_id = dm.id
    LEFT JOIN user_module_licenses uml ON dm.id = uml.module_id AND uml.user_id = target_user_id
    WHERE mdep.dependency_type = 'required'
      AND md.depth < 10 -- Prevent infinite recursion
      AND NOT dm.code = ANY(md.dependency_chain) -- Prevent circular deps
)
SELECT DISTINCT 
    module_id,
    module_code,
    module_name,
    license_status,
    dependency_chain
FROM module_deps
ORDER BY module_code;
$ LANGUAGE sql;

-- Function to check if user has access to a specific thing type
CREATE OR REPLACE FUNCTION user_has_access_to_thing_type(
    target_user_id UUID,
    thing_type_code TEXT
)
RETURNS BOOLEAN AS $
DECLARE
    required_module_code TEXT;
    has_license BOOLEAN;
BEGIN
    -- Get the module required for this thing type
    SELECT m.code INTO required_module_code
    FROM thing_types tt
    JOIN modules m ON tt.module_id = m.id
    WHERE tt.code = thing_type_code;
    
    IF required_module_code IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user has active license (including dependencies)
    SELECT EXISTS (
        SELECT 1 FROM get_required_modules_for_user(target_user_id)
        WHERE module_code = required_module_code
          AND license_status IN ('active', 'trial')
    ) INTO has_license;
    
    RETURN has_license;
END;
$ LANGUAGE plpgsql;

-- Function to get licensing requirements for a set of modules
CREATE OR REPLACE FUNCTION get_licensing_requirements(module_codes TEXT[])
RETURNS TABLE (
    module_code TEXT,
    module_name TEXT,
    license_type TEXT,
    monthly_price DECIMAL(10,2),
    dependency_type TEXT,
    depends_on_module TEXT
) AS $
WITH RECURSIVE required_modules AS (
    -- Base case: requested modules
    SELECT 
        m.id,
        m.code,
        m.name,
        m.license_type,
        m.monthly_price,
        'direct'::TEXT as dependency_type,
        NULL::TEXT as depends_on_module,
        ARRAY[m.code] as module_chain,
        0 as depth
    FROM modules m
    WHERE m.code = ANY(module_codes)
      AND m.is_active = true
    
    UNION
    
    -- Recursive case: required dependencies
    SELECT 
        dm.id,
        dm.code,
        dm.name, 
        dm.license_type,
        dm.monthly_price,
        mdep.dependency_type,
        rm.code as depends_on_module,
        rm.module_chain || dm.code,
        rm.depth + 1
    FROM required_modules rm
    JOIN module_dependencies mdep ON rm.id = mdep.module_id
    JOIN modules dm ON mdep.depends_on_module_id = dm.id
    WHERE mdep.dependency_type = 'required'
      AND rm.depth < 10
      AND NOT dm.code = ANY(rm.module_chain)
)
SELECT DISTINCT
    rm.code,
    rm.name,
    rm.license_type,
    rm.monthly_price,
    rm.dependency_type,
    rm.depends_on_module
FROM required_modules rm
ORDER BY rm.code;
$ LANGUAGE sql;
```

```sql
-- Function to automatically maintain the things table
CREATE OR REPLACE FUNCTION sync_thing()
RETURNS TRIGGER AS $
DECLARE
    thing_type_record RECORD;
    thing_name TEXT;
    thing_title TEXT;
    thing_code TEXT;
    thing_subtitle TEXT;
    owner_id UUID;
    org_id UUID;
    thing_currency TEXT;
    thing_value DECIMAL(20, 2);
    thing_category TEXT;
    thing_subcategory TEXT;
BEGIN
    -- Get thing type information
    SELECT * INTO thing_type_record 
    FROM thing_types 
    WHERE table_name = TG_TABLE_NAME;
    
    IF thing_type_record IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Extract common fields based on table
    CASE TG_TABLE_NAME
        WHEN 'users' THEN
            thing_name := COALESCE(NEW.display_name, NEW.first_name || ' ' || NEW.last_name, NEW.email);
            thing_code := NEW.email;
            owner_id := NEW.id;
            
        WHEN 'organizations' THEN
            thing_name := NEW.name;
            thing_title := NEW.short_name;
            thing_subtitle := NEW.description;
            thing_category := NEW.type;
            
        WHEN 'accounts' THEN
            thing_name := NEW.name;
            thing_code := NEW.account_number;
            thing_subtitle := NEW.institution;
            owner_id := NEW.user_id;
            org_id := NEW.organization_id;
            thing_currency := NEW.currency;
            thing_category := NEW.account_type;
            
        WHEN 'instruments' THEN
            thing_name := NEW.name;
            thing_code := NEW.symbol;
            thing_subtitle := NEW.exchange;
            thing_currency := NEW.currency;
            thing_category := 'instrument';
            thing_subcategory := NEW.sector;
            
        WHEN 'non_fungible_holdings' THEN
            thing_name := NEW.name;
            thing_subtitle := NEW.description;
            owner_id := NEW.user_id;
            org_id := NEW.organization_id;
            thing_currency := NEW.currency;
            thing_value := NEW.current_value;
            
        WHEN 'currencies' THEN
            thing_name := NEW.name;
            thing_code := NEW.code;
            thing_title := NEW.symbol;
            thing_category := 'currency';
            
        -- Add more cases as needed for other tables
        ELSE
            thing_name := 'Unknown';
    END CASE;
    
    -- Insert or update in things table
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO things (
            id, thing_type_id, name, title, code, subtitle,
            owner_user_id, organization_id, currency, value_amount,
            category, subcategory, valid_from, valid_to, transaction_time
        ) VALUES (
            NEW.id, thing_type_record.id, thing_name, thing_title, thing_code, thing_subtitle,
            owner_id, org_id, thing_currency, thing_value,
            thing_category, thing_subcategory, NEW.valid_from, NEW.valid_to, NEW.transaction_time
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            title = EXCLUDED.title,
            code = EXCLUDED.code,
            subtitle = EXCLUDED.subtitle,
            owner_user_id = EXCLUDED.owner_user_id,
            organization_id = EXCLUDED.organization_id,
            currency = EXCLUDED.currency,
            value_amount = EXCLUDED.value_amount,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            valid_from = EXCLUDED.valid_from,
            valid_to = EXCLUDED.valid_to,
            transaction_time = EXCLUDED.transaction_time;
            
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE things 
        SET status = 'deleted', 
            valid_to = OLD.valid_to,
            transaction_time = OLD.transaction_time
        WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$ LANGUAGE plpgsql;

-- Universal search function for users and AI agents
CREATE OR REPLACE FUNCTION search_things(
    search_query TEXT,
    user_id UUID DEFAULT NULL,
    thing_types TEXT[] DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    thing_type_code TEXT,
    name TEXT,
    title TEXT,
    code TEXT,
    subtitle TEXT,
    category TEXT,
    rank REAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        tt.code,
        t.name,
        t.title,
        t.code,
        t.subtitle,
        t.category,
        ts_rank(t.search_vector, websearch_to_tsquery('english', search_query)) as rank
    FROM things t
    JOIN thing_types tt ON t.thing_type_id = tt.id
    WHERE 
        (user_id IS NULL OR t.owner_user_id = user_id OR t.is_public = true)
        AND (thing_types IS NULL OR tt.code = ANY(thing_types))
        AND t.status = 'active'
        AND (
            t.search_vector @@ websearch_to_tsquery('english', search_query)
            OR t.name ILIKE '%' || search_query || '%'
            OR t.code ILIKE '%' || search_query || '%'
        )
        AND t.valid_to > NOW()
    ORDER BY rank DESC, tt.search_weight DESC, t.name
    LIMIT limit_count;
END;
$ LANGUAGE plpgsql;

-- AI semantic search function using vector embeddings
CREATE OR REPLACE FUNCTION search_things_semantic(
    query_embedding VECTOR(1536),
    user_id UUID DEFAULT NULL,
    thing_types TEXT[] DEFAULT NULL,
    similarity_threshold REAL DEFAULT 0.7,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    thing_type_code TEXT,
    name TEXT,
    similarity REAL
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        tt.code,
        t.name,
        1 - (t.embedding <=> query_embedding) as similarity
    FROM things t
    JOIN thing_types tt ON t.thing_type_id = tt.id
    WHERE 
        (user_id IS NULL OR t.owner_user_id = user_id OR t.is_public = true)
        AND (thing_types IS NULL OR tt.code = ANY(thing_types))
        AND t.status = 'active'
        AND t.embedding IS NOT NULL
        AND 1 - (t.embedding <=> query_embedding) > similarity_threshold
        AND t.valid_to > NOW()
    ORDER BY similarity DESC
    LIMIT limit_count;
END;
$ LANGUAGE plpgsql;
```

### 4. Asset Type Definitions

```sql
-- Master table for all asset types
CREATE TABLE asset_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE, -- 'STOCK', 'PROPERTY', 'CASH', etc. (10 chars max)
    name TEXT NOT NULL, -- No length limit
    category TEXT NOT NULL CHECK (category IN ('fungible', 'non_fungible')),
    subcategory TEXT, -- 'equity', 'fixed_income', 'real_estate', etc.
    description TEXT,
    metadata JSONB, -- Type-specific configuration
    notes TEXT, -- Unstructured notes
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Specific instruments for fungible assets (stocks, bonds, etc.)
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type_id UUID NOT NULL REFERENCES asset_types(id),
    symbol VARCHAR(10), -- Ticker symbol (10 chars max) - this is the code for instruments
    isin VARCHAR(12), -- International identifier (ISIN is always 12 chars)
    cusip VARCHAR(9), -- US identifier (CUSIP is always 9 chars)
    name TEXT NOT NULL, -- No length limit
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- Currency code
    exchange TEXT,
    sector TEXT,
    metadata JSONB,
    notes TEXT, -- Unstructured notes
    -- Vector embedding for AI similarity search
    embedding VECTOR(1536),
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Fungible Asset Holdings

```sql
-- Holdings for fungible assets (shares, cash, etc.)
CREATE TABLE fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    account_id UUID NOT NULL, -- References accounts table
    
    -- Quantity and cost basis
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost_per_unit DECIMAL(20, 8),
    total_cost_basis DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Metadata for additional tracking
    lot_method TEXT DEFAULT 'FIFO', -- FIFO, LIFO, specific_identification
    metadata JSONB,
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);

-- Individual lots for tax optimization (specific identification)
CREATE TABLE fungible_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES fungible_holdings(id),
    quantity DECIMAL(20, 8) NOT NULL,
    cost_per_unit DECIMAL(20, 8) NOT NULL,
    acquisition_date DATE NOT NULL,
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Non-Fungible Asset Holdings

```sql
-- Holdings for non-fungible assets (properties, vehicles, etc.)
CREATE TABLE non_fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    asset_type_id UUID NOT NULL REFERENCES asset_types(id),
    
    -- Unique asset identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Financial details
    acquisition_cost DECIMAL(20, 2),
    acquisition_date DATE,
    current_value DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Location and physical attributes
    location JSONB, -- Address, coordinates, etc.
    physical_attributes JSONB, -- Size, year, condition, etc.
    
    -- Legal and ownership details
    ownership_percentage DECIMAL(5, 4) DEFAULT 1.0000, -- For fractional ownership
    legal_documents JSONB, -- Deed, title, registration, etc.
    
    -- Asset-specific metadata
    metadata JSONB, -- Property: bedrooms, bathrooms; Vehicle: VIN, make, model
    
    -- Vector embedding for similarity search
    embedding VECTOR(1536),
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);
```

### 5. Transactions

```sql
-- Unified transaction table for all asset types
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN 
        ('buy', 'sell', 'dividend', 'interest', 'split', 'transfer', 'deposit', 'withdrawal')),
    transaction_date DATE NOT NULL,
    settlement_date DATE,
    
    -- Asset reference (polymorphic)
    fungible_holding_id UUID REFERENCES fungible_holdings(id),
    non_fungible_holding_id UUID REFERENCES non_fungible_holdings(id),
    
    -- Financial details
    quantity DECIMAL(20, 8), -- For fungible assets
    price_per_unit DECIMAL(20, 8), -- For fungible assets
    total_amount DECIMAL(20, 2) NOT NULL,
    fees DECIMAL(20, 2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- References
    account_id UUID NOT NULL,
    counterparty TEXT, -- Broker, exchange, individual
    reference_number TEXT, -- Confirmation number, etc.
    
    -- Metadata and notes
    notes TEXT,
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ,
    
    -- Constraints
    CHECK ((fungible_holding_id IS NULL) != (non_fungible_holding_id IS NULL))
);
```

### 5. Accounts & Portfolios

```sql
-- Accounts (brokerage, bank, etc.)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    name TEXT NOT NULL, -- No length limit
    account_type TEXT NOT NULL CHECK (account_type IN 
        ('brokerage', 'bank', 'retirement', 'trust', 'entity')),
    account_number VARCHAR(10), -- Account number as code (10 chars max)
    institution TEXT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD', -- Currency code
    
    -- Account settings
    is_active BOOLEAN DEFAULT true,
    tax_treatment TEXT, -- 'taxable', 'tax_deferred', 'tax_free'
    
    metadata JSONB,
    notes TEXT, -- Unstructured notes
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio groupings
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    name TEXT NOT NULL, -- No length limit
    code VARCHAR(10), -- Portfolio code/identifier (10 chars max)
    description TEXT,
    portfolio_type TEXT DEFAULT 'standard',
    
    -- Portfolio configuration
    benchmark_symbol VARCHAR(10), -- For performance comparison (10 chars max)
    target_allocation JSONB, -- Desired asset allocation
    rebalancing_rules JSONB,
    
    notes TEXT, -- Unstructured notes
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-organization relationships
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    role TEXT NOT NULL,
    permissions JSONB,
    notes TEXT, -- Unstructured notes
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Account-Portfolio relationships
CREATE TABLE portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    weight DECIMAL(5, 4), -- Portfolio weighting
    notes TEXT, -- Unstructured notes
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7. Market Data & Valuations

```sql
-- Market prices for fungible assets
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    price_date DATE NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    source TEXT NOT NULL, -- 'bloomberg', 'yahoo', etc.
    price_type TEXT DEFAULT 'close', -- 'open', 'high', 'low', 'close'
    volume BIGINT,
    metadata JSONB,
    
    -- Temporal support (for price corrections)
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(instrument_id, price_date, price_type, valid_from)
);

-- Valuations for non-fungible assets
CREATE TABLE asset_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    non_fungible_holding_id UUID NOT NULL REFERENCES non_fungible_holdings(id),
    valuation_date DATE NOT NULL,
    value DECIMAL(20, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    valuation_method TEXT NOT NULL, -- 'appraisal', 'comparable_sales', 'cost', etc.
    appraiser TEXT,
    confidence_level TEXT, -- 'high', 'medium', 'low'
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8. AI & Analytics Support

```sql
-- Store AI analysis results
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    insight_type TEXT NOT NULL, -- 'recommendation', 'risk_analysis', 'allocation_advice'
    content JSONB NOT NULL,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    expires_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversation history
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Triggers to Maintain Things Table

```sql
-- Create triggers for all searchable tables
DO $ 
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM thing_types t 
        WHERE t.is_searchable = true
    LOOP
        EXECUTE format('
            CREATE TRIGGER sync_things_%s_trigger
            AFTER INSERT OR UPDATE OR DELETE ON %I
            FOR EACH ROW EXECUTE FUNCTION sync_thing();
        ', table_name, table_name);
    END LOOP;
END $;

-- Example trigger creation (would be auto-generated)
CREATE TRIGGER sync_things_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION sync_thing();

CREATE TRIGGER sync_things_accounts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON accounts
    FOR EACH ROW EXECUTE FUNCTION sync_thing();

CREATE TRIGGER sync_things_instruments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON instruments
    FOR EACH ROW EXECUTE FUNCTION sync_thing();
```

## Indexes and Performance Optimization

```sql
-- Universal search indexes
CREATE INDEX things_search_vector_idx ON things USING gin(search_vector);
CREATE INDEX things_owner_status_idx ON things (owner_user_id, status, valid_to);
CREATE INDEX things_type_category_idx ON things (thing_type_id, category);
CREATE INDEX things_name_gin_idx ON things USING gin(name gin_trgm_ops);
CREATE INDEX things_code_gin_idx ON things USING gin(code gin_trgm_ops);

-- Vector similarity search indexes
CREATE INDEX things_embedding_idx ON things USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX instruments_embedding_idx ON instruments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX non_fungible_holdings_embedding_idx ON non_fungible_holdings USING ivfflat (embedding vector_cosine_ops);

-- Temporal query indexes
CREATE INDEX ON fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON non_fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON transactions (user_id, transaction_date, valid_from, valid_to);
CREATE INDEX ON market_prices (instrument_id, price_date, valid_from);

-- Performance indexes
CREATE INDEX ON transactions (fungible_holding_id) WHERE fungible_holding_id IS NOT NULL;
CREATE INDEX ON transactions (non_fungible_holding_id) WHERE non_fungible_holding_id IS NOT NULL;
CREATE INDEX ON fungible_holdings (instrument_id);
CREATE INDEX ON non_fungible_holdings (asset_type_id);
```

## Temporal Query Examples

```sql
-- Point-in-time portfolio value
SELECT 
    fh.instrument_id,
    i.name,
    fh.quantity,
    mp.price,
    (fh.quantity * mp.price) as market_value
FROM fungible_holdings fh
JOIN instruments i ON fh.instrument_id = i.id
JOIN market_prices mp ON mp.instrument_id = i.id
WHERE fh.user_id = $1
    AND fh.valid_from <= $2 AND fh.valid_to > $2  -- Point in time
    AND mp.price_date = $2;

-- Historical corrections with audit trail
SELECT 
    transaction_time,
    valid_from,
    valid_to,
    quantity,
    'CORRECTED' as status
FROM fungible_holdings 
WHERE id = $1 
ORDER BY transaction_time;
```

This data model provides:
- ✅ Clear separation of fungible and non-fungible assets
- ✅ Comprehensive temporal support for all entities
- ✅ Vector search capabilities for AI features
- ✅ Flexible metadata storage with JSONB
- ✅ Audit trails and historical corrections
- ✅ Performance optimization for common queries
- ✅ Support for complex portfolio structures
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Asset Type Definitions

```sql
-- Master table for all asset types
CREATE TABLE asset_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- 'STOCK', 'PROPERTY', 'CASH', etc.
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fungible', 'non_fungible')),
    subcategory TEXT, -- 'equity', 'fixed_income', 'real_estate', etc.
    metadata JSONB, -- Type-specific configuration
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Specific instruments for fungible assets (stocks, bonds, etc.)
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type_id UUID NOT NULL REFERENCES asset_types(id),
    symbol TEXT, -- Ticker symbol
    isin TEXT, -- International identifier
    cusip TEXT, -- US identifier
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    exchange TEXT,
    sector TEXT,
    metadata JSONB,
    -- Vector embedding for AI similarity search
    embedding VECTOR(1536),
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Fungible Asset Holdings

```sql
-- Holdings for fungible assets (shares, cash, etc.)
CREATE TABLE fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    account_id UUID NOT NULL, -- References accounts table
    
    -- Quantity and cost basis
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost_per_unit DECIMAL(20, 8),
    total_cost_basis DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Metadata for additional tracking
    lot_method TEXT DEFAULT 'FIFO', -- FIFO, LIFO, specific_identification
    metadata JSONB,
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);

-- Individual lots for tax optimization (specific identification)
CREATE TABLE fungible_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    holding_id UUID NOT NULL REFERENCES fungible_holdings(id),
    quantity DECIMAL(20, 8) NOT NULL,
    cost_per_unit DECIMAL(20, 8) NOT NULL,
    acquisition_date DATE NOT NULL,
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Non-Fungible Asset Holdings

```sql
-- Holdings for non-fungible assets (properties, vehicles, etc.)
CREATE TABLE non_fungible_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    asset_type_id UUID NOT NULL REFERENCES asset_types(id),
    
    -- Unique asset identification
    name TEXT NOT NULL,
    description TEXT,
    
    -- Financial details
    acquisition_cost DECIMAL(20, 2),
    acquisition_date DATE,
    current_value DECIMAL(20, 2),
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Location and physical attributes
    location JSONB, -- Address, coordinates, etc.
    physical_attributes JSONB, -- Size, year, condition, etc.
    
    -- Legal and ownership details
    ownership_percentage DECIMAL(5, 4) DEFAULT 1.0000, -- For fractional ownership
    legal_documents JSONB, -- Deed, title, registration, etc.
    
    -- Asset-specific metadata
    metadata JSONB, -- Property: bedrooms, bathrooms; Vehicle: VIN, make, model
    
    -- Vector embedding for similarity search
    embedding VECTOR(1536),
    
    -- Temporal columns
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ
);
```

### 5. Transactions

```sql
-- Unified transaction table for all asset types
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN 
        ('buy', 'sell', 'dividend', 'interest', 'split', 'transfer', 'deposit', 'withdrawal')),
    transaction_date DATE NOT NULL,
    settlement_date DATE,
    
    -- Asset reference (polymorphic)
    fungible_holding_id UUID REFERENCES fungible_holdings(id),
    non_fungible_holding_id UUID REFERENCES non_fungible_holdings(id),
    
    -- Financial details
    quantity DECIMAL(20, 8), -- For fungible assets
    price_per_unit DECIMAL(20, 8), -- For fungible assets
    total_amount DECIMAL(20, 2) NOT NULL,
    fees DECIMAL(20, 2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- References
    account_id UUID NOT NULL,
    counterparty TEXT, -- Broker, exchange, individual
    reference_number TEXT, -- Confirmation number, etc.
    
    -- Metadata and notes
    notes TEXT,
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_time TIMESTAMPTZ,
    
    -- Constraints
    CHECK ((fungible_holding_id IS NULL) != (non_fungible_holding_id IS NULL))
);
```

### 6. Accounts & Portfolios

```sql
-- Accounts (brokerage, bank, etc.)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN 
        ('brokerage', 'bank', 'retirement', 'trust', 'entity')),
    account_number TEXT,
    institution TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Account settings
    is_active BOOLEAN DEFAULT true,
    tax_treatment TEXT, -- 'taxable', 'tax_deferred', 'tax_free'
    
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio groupings
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    
    name TEXT NOT NULL,
    description TEXT,
    portfolio_type TEXT DEFAULT 'standard',
    
    -- Portfolio configuration
    benchmark_symbol TEXT, -- For performance comparison
    target_allocation JSONB, -- Desired asset allocation
    rebalancing_rules JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Account-Portfolio relationships
CREATE TABLE portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    weight DECIMAL(5, 4), -- Portfolio weighting
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7. Market Data & Valuations

```sql
-- Market prices for fungible assets
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID NOT NULL REFERENCES instruments(id),
    price_date DATE NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    source TEXT NOT NULL, -- 'bloomberg', 'yahoo', etc.
    price_type TEXT DEFAULT 'close', -- 'open', 'high', 'low', 'close'
    volume BIGINT,
    metadata JSONB,
    
    -- Temporal support (for price corrections)
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(instrument_id, price_date, price_type, valid_from)
);

-- Valuations for non-fungible assets
CREATE TABLE asset_valuations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    non_fungible_holding_id UUID NOT NULL REFERENCES non_fungible_holdings(id),
    valuation_date DATE NOT NULL,
    value DECIMAL(20, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    valuation_method TEXT NOT NULL, -- 'appraisal', 'comparable_sales', 'cost', etc.
    appraiser TEXT,
    confidence_level TEXT, -- 'high', 'medium', 'low'
    metadata JSONB,
    
    -- Temporal support
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    transaction_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8. AI & Analytics Support

```sql
-- Store AI analysis results
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    insight_type TEXT NOT NULL, -- 'recommendation', 'risk_analysis', 'allocation_advice'
    content JSONB NOT NULL,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    expires_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversation history
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes and Performance Optimization

```sql
-- Temporal query indexes
CREATE INDEX ON fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON non_fungible_holdings (user_id, valid_from, valid_to);
CREATE INDEX ON transactions (user_id, transaction_date, valid_from, valid_to);
CREATE INDEX ON market_prices (instrument_id, price_date, valid_from);

-- Vector similarity search indexes
CREATE INDEX ON instruments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON non_fungible_holdings USING ivfflat (embedding vector_cosine_ops);

-- Performance indexes
CREATE INDEX ON transactions (fungible_holding_id) WHERE fungible_holding_id IS NOT NULL;
CREATE INDEX ON transactions (non_fungible_holding_id) WHERE non_fungible_holding_id IS NOT NULL;
CREATE INDEX ON fungible_holdings (instrument_id);
CREATE INDEX ON non_fungible_holdings (asset_type_id);
```

## Temporal Query Examples

```sql
-- Point-in-time portfolio value
SELECT 
    fh.instrument_id,
    i.name,
    fh.quantity,
    mp.price,
    (fh.quantity * mp.price) as market_value
FROM fungible_holdings fh
JOIN instruments i ON fh.instrument_id = i.id
JOIN market_prices mp ON mp.instrument_id = i.id
WHERE fh.user_id = $1
    AND fh.valid_from <= $2 AND fh.valid_to > $2  -- Point in time
    AND mp.price_date = $2;

-- Historical corrections with audit trail
SELECT 
    transaction_time,
    valid_from,
    valid_to,
    quantity,
    'CORRECTED' as status
FROM fungible_holdings 
WHERE id = $1 
ORDER BY transaction_time;
```

This data model provides:
- ✅ Clear separation of fungible and non-fungible assets
- ✅ Comprehensive temporal support for all entities
- ✅ Vector search capabilities for AI features
- ✅ Flexible metadata storage with JSONB
- ✅ Audit trails and historical corrections
- ✅ Performance optimization for common queries
- ✅ Support for complex portfolio structures
