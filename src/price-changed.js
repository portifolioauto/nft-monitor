import AWS from "aws-sdk";

const SES = new AWS.SES();

export async function main(event) {
  const message = event.Records[0].Sns.Message;
  const jsonMessage = JSON.parse(message);
  const {
    slug,
    high_floor_price,
    low_floor_price,
    last_floor_price,
    market_cap,
    average_price,
  } = jsonMessage;

  const subject = `Price changed for ${slug}`;
  const plainTextBody = `High Floor Price: ${high_floor_price}, \nLow Floor Price: ${low_floor_price}, \nLast Floor Price: ${last_floor_price}, \nMarket Cap: ${market_cap}, \nAverage Price: ${average_price}`;

  const params = {
    Destination: {
      ToAddresses: ["csalucasnascimento@gmail.com", "jossandro@gmail.com"],
    },
    Message: {
      Body: {
        Text: { Data: plainTextBody },
      },
      Subject: { Data: subject },
    },
    Source: "csalucasnascimento@gmail.com",
  };

  await SES.sendEmail(params).promise();

  return message;
}
