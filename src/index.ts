import mongodb from 'mongodb';
import 'dotenv/config';
import Bot from '@/bot';
import UsersRepository from '@/repositories/users';
import FinanceApi from '@/api/finance';
import FinanceAggregation from '@/utils/finance-aggregation';

async function main() {
  try {
    const mongoClient = await new mongodb.MongoClient(process.env.MONGO_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).connect();

    const usersCollection = mongoClient.db().collection('users');
    const usersRepository = new UsersRepository(usersCollection);
    const financeApi = new FinanceApi();
    const financeAggregation = new FinanceAggregation(financeApi);

    const bot = new Bot(
      process.env.BOT_TOKEN!,
      Number(process.env.PORT!),
      usersRepository,
      financeAggregation,
    );

    bot.setWebHook(`${process.env.URL}/bot${process.env.BOT_TOKEN}`);
  } catch (e) {
    console.error(e);
  }
}

main();
