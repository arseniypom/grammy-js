require('dotenv').config();
const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');

const moodKeyboard = new Keyboard()
  .text('Хорошо')
  .row()
  .text('Нормально')
  .row()
  .text('Плохо')
  .resized();

const moodLabels = ['Хорошо', 'Нормально', 'Плохо'];
const rows = moodLabels.map((label) => [Keyboard.text(label)]);
const moodKeyboard2 = Keyboard.from(rows).resized();

const inlineKeyboard = new InlineKeyboard()
  .pay('1', 'button-1')
  .text('2', 'button-2')
  .text('3', 'button-3');

const shareKeyboard = new Keyboard()
  .requestLocation('Геолокация')
  .requestContact('Контакт')
  .requestPoll('Опрос')
  .placeholder('Я хочу поделиться...')
  .resized();

const menuKeyboard = new InlineKeyboard()
  .text('Узнать статус заказа', 'order-status')
  .text('Обратиться в поддержку', 'support');
const backKeyboard = new InlineKeyboard().text('< Назад в меню', 'back');

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

bot.command('menu', async (ctx) => {
  await ctx.reply('Выберите пункт меню', {
    reply_markup: menuKeyboard,
  });
});

bot.callbackQuery('order-status', async (ctx) => {
  // await ctx.callbackQuery.message.editText('Статус заказа: В пути', {
  //   reply_markup: backKeyboard,
  // });
  await ctx.api.editMessageText(
    ctx.chat.id,
    ctx.update.callback_query.message.message_id,
    'Статус заказа: В пути',
    {
      reply_markup: backKeyboard,
    },
  );
  await ctx.answerCallbackQuery();
});

bot.callbackQuery('support', async (ctx) => {
  await ctx.callbackQuery.message.editText('Напишите Ваш вопрос', {
    reply_markup: backKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery('back', async (ctx) => {
  await ctx.callbackQuery.message.editText('Выберите пункт меню', {
    reply_markup: menuKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.command('start', async (ctx) => {
  await ctx.react('👍');
  await ctx.reply('Привет! Я - Бот 🤖');
});

bot.command('keyboard', async (ctx) => {
  await ctx.reply('Как настроение?', {
    reply_markup: moodKeyboard2,
  });
});

bot.command('inline_keyboard', async (ctx) => {
  await ctx.reply('Выберите цифру', {
    reply_markup: inlineKeyboard,
  });
});

bot.callbackQuery(/button-[1-3]/, async (ctx) => {
  await ctx.reply(`Нажата кнопка ${ctx.callbackQuery.data}`);
  await ctx.answerCallbackQuery();
});

// bot.on('callback_query:data', async (ctx) => {
//   await ctx.reply(`Нажата кнопка ${ctx.callbackQuery.data}`);
//   await ctx.answerCallbackQuery();
// });

bot.command('share', async (ctx) => {
  await ctx.reply('Какими данными хочешь поделиться?', {
    reply_markup: shareKeyboard,
  });
});

bot.on(':location', async (ctx) => {
  await ctx.reply('Спасибо за геолокацию!');
});
bot.on(':contact', async (ctx) => {
  await ctx.reply('Спасибо за контакт!');
});

bot.hears('Хорошо', async (ctx) => {
  await ctx.reply('Рад слышать!');
});

bot.on('message', async (ctx) => {
  console.log(ctx.from);
  await ctx.reply(
    'Привет! Подпишись на <a href="https://t.me/pomazkovjs">телеграм-канал</a> pomazkov.js',
    {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    },
  );
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

bot.start();
