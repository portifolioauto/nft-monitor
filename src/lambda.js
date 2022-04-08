import AWS from "aws-sdk";
import client from "data-api-client";
import fetch from "node-fetch";
import handler from "./util/handler";

const sns = new AWS.SNS();
const API = "https://api.opensea.io/api/v1";
let topicArn = "";

const COLLECTIONS = [
  "murixhaus",
  "world-of-women-galaxy",
  "boredapeyachtclub",
  "cryptopunks",
  "adidasoriginals",
  "criptosocios",
];

export const main = handler(async (event) => {
  const db = getDB(event);
  topicArn = event.topicArn;

  const { stats } = await getStatusCollection();
  const { records } = await getStatus(db);

  if (records.length === 0) {
    await postStatus(db, stats);
  } else {
    const { objUpdate, isSendNotification } = await compareStatus(
      stats,
      records[0]
    );
    await putStatus(db, objUpdate);
    if (isSendNotification) {
      await sendNotification(objUpdate);
    }
  }

  return {
    statusCode: 200,
    body: { data: records[0] },
  };
});

function getDB(event) {
  return client({
    database: event.database,
    secretArn: event.secretArn,
    resourceArn: event.clusterArn,
  });
}

async function getStatus(db) {
  const result = await db.query(
    `SELECT * FROM collection_stats WHERE slug = :slug AND date = CURRENT_DATE`,
    { slug: COLLECTIONS[0] }
  );
  return result;
}

async function putStatus(db, obj) {
  const result = await db.query(
    `UPDATE collection_stats SET high_floor_price = :high_floor_price, low_floor_price = :low_floor_price, last_floor_price = :last_floor_price, market_cap = :market_cap, average_price = :average_price WHERE slug = :slug AND date = CURRENT_DATE`,
    {
      high_floor_price: obj.high_floor_price,
      low_floor_price: obj.low_floor_price,
      last_floor_price: obj.last_floor_price,
      market_cap: obj.market_cap,
      average_price: obj.average_price,
      slug: COLLECTIONS[0],
    }
  );
  return result;
}

async function postStatus(db, obj) {
  const result = await db.query(
    `INSERT INTO collection_stats (slug, high_floor_price, low_floor_price, last_floor_price, market_cap, average_price, date) VALUES (:slug, :high_floor_price, :low_floor_price, :last_floor_price, :market_cap, :average_price, CURRENT_DATE)`,
    {
      slug: COLLECTIONS[0],
      high_floor_price: obj.floor_price,
      low_floor_price: obj.floor_price,
      last_floor_price: obj.floor_price,
      market_cap: obj.market_cap,
      average_price: obj.average_price,
    }
  );
  return result;
}

function compareStatus(stats, records) {
  let isSendNotification = false;
  const objUpdate = {
    high_floor_price: parseFloat(records.high_floor_price),
    low_floor_price: parseFloat(records.low_floor_price),
    last_floor_price: parseFloat(records.last_floor_price),
    market_cap: parseFloat(records.market_cap),
    average_price: parseFloat(records.average_price),
    slug: records.slug,
  };

  if (stats.floor_price > objUpdate.high_floor_price) {
    objUpdate.high_floor_price = stats.floor_price;
  }

  if (stats.floor_price < objUpdate.low_floor_price) {
    objUpdate.low_floor_price = stats.floor_price;
    isSendNotification = true;
  }

  if (stats.floor_price !== objUpdate.last_floor_price) {
    objUpdate.last_floor_price = stats.floor_price;
  }

  objUpdate.market_cap = stats.market_cap;
  objUpdate.average_price = stats.average_price;
  objUpdate.slug = records.slug;

  return { objUpdate, isSendNotification };
}

function getStatusCollection() {
  return fetch(`${API}/collection/${COLLECTIONS[0]}/stats`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

function sendNotification(message) {
  return sns
    .publish({
      TopicArn: topicArn,
      Message: JSON.stringify(message),
      MessageStructure: "string",
    })
    .promise();
}
