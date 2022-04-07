async function up(db) {
  await db.schema
    .createTable("collection_stats")
    .addColumn("collection_stats_id", "serial", (col) => col.primaryKey())
    .addColumn("slug", "text", (col) => col.notNull())
    .addColumn("high_floor_price", "numeric(18, 18)", (col) => col.notNull())
    .addColumn("low_floor_price", "numeric(18, 18)", (col) => col.notNull())
    .addColumn("last_floor_price", "numeric(18, 18)", (col) => col.notNull())
    .addColumn("market_cap", "numeric(18, 2)", (col) => col.notNull())
    .addColumn("average_price", "numeric(18, 18)", (col) => col.notNull())
    .addColumn("date", "date", (col) => col.notNull())
    .execute();
}

async function down(db) {
  await db.schema.dropTable("collection_stats").execute();
}

module.exports = { up, down };
