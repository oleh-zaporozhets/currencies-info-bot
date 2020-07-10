import 'dotenv/config';
import mongodb from 'mongodb';
import FinanceApi from '@/api/finance';
import Bot from '@/bot';
import FinanceAggregation from '@/finance-aggregation';
import UsersRepository from '@/repositories/users';
import ResponseBuilder from '@/response-builder';

async function main() {
  try {
    const mongoClient = await new mongodb.MongoClient(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).connect();

    const db = mongoClient.db();

    const usersRepository = new UsersRepository(db);
    const responseBuilder = new ResponseBuilder();
    const financeApi = new FinanceApi();
    const financeAggregation = new FinanceAggregation(financeApi, responseBuilder);

    const bot = new Bot(
      process.env.BOT_TOKEN,
      Number(process.env.PORT),
      usersRepository,
      financeAggregation,
      responseBuilder,
    );

    bot.setWebHook(`${process.env.URL}/bot${process.env.BOT_TOKEN}`);
  } catch (e) {
    process.stdout.write(e);
  }
}

main();
